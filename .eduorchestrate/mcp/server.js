#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import readline from "node:readline";

const tools = [
  { name: "eduorchestrate_onboard", description: "Run EduOrchestrate onboarding." },
  { name: "eduorchestrate_plan30", description: "Generate a 30-day EduOrchestrate plan." },
  { name: "eduorchestrate_send_today", description: "Send or dry-run today's learning email." },
  { name: "eduorchestrate_review_progress", description: "Review learner progress through the CLI fallback." }
];

function respond(id, result) {
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, result })}\n`);
}

function run(args) {
  const out = spawnSync("npx", ["eduorchestrate", ...args], { encoding: "utf8" });
  return { stdout: out.stdout, stderr: out.stderr, status: out.status };
}

const rl = readline.createInterface({ input: process.stdin });
rl.on("line", (line) => {
  const msg = JSON.parse(line);
  if (msg.method === "initialize") {
    respond(msg.id, { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "eduorchestrate", version: "0.1.0" } });
    return;
  }
  if (msg.method === "tools/list") {
    respond(msg.id, { tools });
    return;
  }
  if (msg.method === "tools/call") {
    const name = msg.params?.name;
    const dryRun = msg.params?.arguments?.dryRun !== false;
    if (name === "eduorchestrate_onboard") respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["--yes"]), null, 2) }] });
    else if (name === "eduorchestrate_plan30") respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["plan", "--days", "30"]), null, 2) }] });
    else if (name === "eduorchestrate_send_today") respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["send-today", ...(dryRun ? ["--dry-run"] : [])]), null, 2) }] });
    else respond(msg.id, { content: [{ type: "text", text: "Use npx eduorchestrate review-progress in the terminal with progress details." }] });
  }
});
