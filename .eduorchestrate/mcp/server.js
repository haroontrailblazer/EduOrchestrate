#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import readline from "node:readline";

const tools = [
  { name: "eduorchestrate_onboard", description: "Run EduOrchestrate onboarding." },
  { name: "eduorchestrate_harness", description: "Create the compact token-conscious execution harness." },
  { name: "eduorchestrate_plan30", description: "Generate a 30-day-minimum EduOrchestrate plan." },
  { name: "eduorchestrate_research", description: "Create a sourced trend research digest for a day or topic." },
  { name: "eduorchestrate_send_today", description: "Send or dry-run today's learning email." },
  { name: "eduorchestrate_log_progress", description: "Log learner progress evidence." },
  { name: "eduorchestrate_progress_card", description: "Run the prebuilt program that writes the role, skill, GitHub-style progression, and terminal card artifacts." },
  { name: "eduorchestrate_terminal_card", description: "Run the prebuilt program that writes the exact SVG terminal-card artifact." },
  { name: "eduorchestrate_weekly_summary", description: "Summarize a learning week." },
  { name: "eduorchestrate_recommend_next", description: "Recommend the next skill after the current plan window." },
  { name: "eduorchestrate_status", description: "Show current plan and momentum status." }
];

function respond(id, result) { process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n"); }
function run(args) { const out = spawnSync("npx", ["eduorchestrate", ...args], { encoding: "utf8" }); return { stdout: out.stdout, stderr: out.stderr, status: out.status }; }

const rl = readline.createInterface({ input: process.stdin });
rl.on("line", (line) => {
  const msg = JSON.parse(line);
  if (msg.method === "initialize") return respond(msg.id, { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "eduorchestrate", version: "0.3.0" } });
  if (msg.method === "tools/list") return respond(msg.id, { tools });
  if (msg.method === "tools/call") {
    const name = msg.params?.name;
    const args = msg.params?.arguments || {};
    const dryRun = args.dryRun !== false;
    if (name === "eduorchestrate_onboard") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["--yes"]), null, 2) }] });
    if (name === "eduorchestrate_harness") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["harness", "--mode", args.mode || "daily"]), null, 2) }] });
    if (name === "eduorchestrate_plan30") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["plan", "--days", String(Math.max(30, Number(args.days || 30)))]), null, 2) }] });
    if (name === "eduorchestrate_research") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["research", "--day", String(args.day || 1), ...(args.topic ? ["--topic", args.topic] : [])]), null, 2) }] });
    if (name === "eduorchestrate_send_today") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["send-today", ...(dryRun ? ["--dry-run"] : [])]), null, 2) }] });
    if (name === "eduorchestrate_log_progress") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["log-progress", "--day", String(args.day || 1), "--completed", args.completed || "Completed today's task", "--evidence", args.evidence || "Evidence not provided"]), null, 2) }] });
    if (name === "eduorchestrate_progress_card") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["progress-card"]), null, 2) }] });
    if (name === "eduorchestrate_terminal_card") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["terminal-card"]), null, 2) }] });
    if (name === "eduorchestrate_weekly_summary") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["weekly-summary", "--week", String(args.week || 1)]), null, 2) }] });
    if (name === "eduorchestrate_recommend_next") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["recommend-next"]), null, 2) }] });
    if (name === "eduorchestrate_status") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["status"]), null, 2) }] });
  }
});
