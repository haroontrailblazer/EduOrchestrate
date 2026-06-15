import crypto from "node:crypto";
import net from "node:net";
import tls from "node:tls";

export function smtpConfigFromEnv(env = process.env) {
  return {
    host: env.SMTP_HOST,
    port: Number.parseInt(env.SMTP_PORT || "465", 10),
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.SMTP_FROM || env.SMTP_USER
  };
}

export async function sendMail({ smtp, message, dryRun = false }) {
  if (dryRun) {
    return { dryRun: true, message };
  }
  validateSmtp(smtp);
  // Port 465 = implicit TLS. Anything else (e.g. 587) starts plaintext and
  // upgrades via STARTTLS. Both paths end fully encrypted before AUTH.
  const implicitTls = smtp.port === 465;
  let socket = implicitTls
    ? tls.connect({ host: smtp.host, port: smtp.port, servername: smtp.host })
    : net.connect({ host: smtp.host, port: smtp.port });
  let client = new SmtpClient(socket);
  await client.expect(220);
  await client.command("EHLO eduorchestrate.local", 250);
  if (!implicitTls) {
    await client.command("STARTTLS", 220);
    socket = await upgradeToTls(socket, smtp.host);
    client = new SmtpClient(socket);
    await client.command("EHLO eduorchestrate.local", 250);
  }
  await client.command("AUTH LOGIN", 334);
  await client.command(Buffer.from(smtp.user).toString("base64"), 334);
  await client.command(Buffer.from(smtp.pass).toString("base64"), 235);
  await client.command(`MAIL FROM:<${smtp.from}>`, 250);
  await client.command(`RCPT TO:<${message.to}>`, 250);
  await client.command("DATA", 354);
  await client.raw(renderSmtpMessage(smtp.from, message));
  await client.expect(250);
  await client.command("QUIT", 221);
  socket.end();
  return { sent: true, to: message.to, subject: message.subject, transport: implicitTls ? "implicit-tls" : "starttls" };
}

function upgradeToTls(socket, host) {
  // Hand the plaintext socket to the TLS layer after STARTTLS. Detach the old
  // plaintext reader first so it does not consume encrypted bytes.
  socket.removeAllListeners("data");
  socket.removeAllListeners("error");
  return new Promise((resolve, reject) => {
    const secureSocket = tls.connect({ socket, servername: host }, () => resolve(secureSocket));
    secureSocket.once("error", reject);
  });
}

function validateSmtp(smtp) {
  for (const key of ["host", "port", "user", "pass", "from"]) {
    if (!smtp[key]) throw new Error(`Missing SMTP config: ${key}`);
  }
}

function renderSmtpMessage(from, message) {
  const headers = [
    `From: ${from}`,
    `To: ${message.to}`,
    `Subject: ${message.subject}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@eduorchestrate>`,
    "MIME-Version: 1.0"
  ];
  if (message.html) {
    const boundary = `eo_${crypto.randomBytes(12).toString("hex")}`;
    return [
      ...headers,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      "Content-Type: text/plain; charset=utf-8",
      "Content-Transfer-Encoding: base64",
      "",
      base64Lines(message.text),
      `--${boundary}`,
      "Content-Type: text/html; charset=utf-8",
      "Content-Transfer-Encoding: base64",
      "",
      base64Lines(message.html),
      `--${boundary}--`,
      ".",
      ""
    ].join("\r\n");
  }
  return [
    ...headers,
    "Content-Type: text/plain; charset=utf-8",
    "",
    dotStuff(message.text),
    ".",
    ""
  ].join("\r\n");
}

// base64 split into 76-char lines (RFC 2045); base64 never starts a line with
// "." so no SMTP dot-stuffing is needed for these parts.
function base64Lines(value) {
  return (Buffer.from(String(value), "utf8").toString("base64").match(/.{1,76}/g) || [""]).join("\r\n");
}

function dotStuff(text) {
  return String(text).replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..");
}

class SmtpClient {
  constructor(socket) {
    this.socket = socket;
    this.buffer = "";
    this.waiters = [];
    socket.setEncoding("utf8");
    socket.on("data", (chunk) => {
      this.buffer += chunk;
      this.flush();
    });
    socket.on("error", (error) => {
      for (const waiter of this.waiters.splice(0)) waiter.reject(error);
    });
  }

  raw(line) {
    this.socket.write(line);
  }

  async command(line, code) {
    this.socket.write(`${line}\r\n`);
    return this.expect(code);
  }

  expect(code) {
    return new Promise((resolve, reject) => {
      this.waiters.push({ code: String(code), resolve, reject });
      this.flush();
    });
  }

  flush() {
    if (!this.buffer.includes("\n") || this.waiters.length === 0) return;
    const lines = this.buffer.split(/\r?\n/).filter(Boolean);
    const last = lines[lines.length - 1] || "";
    const waiter = this.waiters[0];
    if (last.startsWith(waiter.code)) {
      this.waiters.shift();
      this.buffer = "";
      waiter.resolve(last);
    } else if (/^[45]\d\d/.test(last)) {
      this.waiters.shift();
      this.buffer = "";
      waiter.reject(new Error(last));
    }
  }
}
