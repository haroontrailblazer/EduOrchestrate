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
  const secure = smtp.port === 465;
  const socket = secure
    ? tls.connect({ host: smtp.host, port: smtp.port, servername: smtp.host })
    : net.connect({ host: smtp.host, port: smtp.port });
  const client = new SmtpClient(socket);
  await client.expect(220);
  await client.command(`EHLO eduorchestrate.local`, 250);
  if (!secure) {
    await client.command("STARTTLS", 220);
    throw new Error("STARTTLS upgrade is not implemented in the dependency-free mailer. Use SMTP port 465 or --dry-run.");
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
  return { sent: true, to: message.to, subject: message.subject };
}

function validateSmtp(smtp) {
  for (const key of ["host", "port", "user", "pass", "from"]) {
    if (!smtp[key]) throw new Error(`Missing SMTP config: ${key}`);
  }
}

function renderSmtpMessage(from, message) {
  return [
    `From: ${from}`,
    `To: ${message.to}`,
    `Subject: ${message.subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    message.text,
    ".",
    ""
  ].join("\r\n");
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
