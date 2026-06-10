import fs from "node:fs";
import path from "node:path";
import { ensureDir } from "./config.js";

const UNIVERSAL_PROMPT = `Use /eduorchestrate as the learner command. When invoked, load the EduOrchestrate workflow, ask for missing learner profile details, generate or update the 30-day plan, and keep recommendations practical, sourced, and focused. If native slash commands are unavailable, treat "eduorchestrate" or "use EduOrchestrate" as equivalent to /eduorchestrate.`;

export function writeAgentAdapters(rootDir = process.cwd()) {
  const outputs = [];
  outputs.push(writeFile(rootDir, ".claude/skills/eduorchestrate/SKILL.md", claudeSkill()));
  outputs.push(writeFile(rootDir, "AGENTS.md", agentsMd()));
  outputs.push(writeFile(rootDir, "GEMINI.md", geminiMd()));
  outputs.push(writeFile(rootDir, ".eduorchestrate/adapters/codex/AGENTS.md", agentsMd()));
  outputs.push(writeFile(rootDir, ".eduorchestrate/adapters/openclaw/SKILL.md", genericSkill("openclaw")));
  outputs.push(writeFile(rootDir, ".eduorchestrate/adapters/antigravity/manifest.json", adapterManifest("antigravity")));
  outputs.push(writeFile(rootDir, ".eduorchestrate/adapters/hermas/manifest.json", adapterManifest("hermas")));
  outputs.push(writeFile(rootDir, ".eduorchestrate/adapters/generic/EDUORCHESTRATE.md", genericInstructions()));
  outputs.push(writeFile(rootDir, ".eduorchestrate/mcp/server.js", mcpServer()));
  outputs.push(writeFile(rootDir, ".eduorchestrate/mcp/manifest.json", mcpManifest()));
  return outputs;
}

function writeFile(rootDir, relativePath, content) {
  const filePath = path.join(rootDir, relativePath);
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
  return relativePath;
}

function claudeSkill() {
  return `---\nname: eduorchestrate\ndescription: Use /eduorchestrate to onboard a learner, create a 30-day job-role plan, research references, send daily plan emails, and review progress.\n---\n\n# EduOrchestrate\n\n${UNIVERSAL_PROMPT}\n\nRun local commands when needed:\n\n\`\`\`bash\nnpx eduorchestrate\nnpx eduorchestrate send-today --dry-run\n\`\`\`\n`;
}

function agentsMd() {
  return `# EduOrchestrate Agent Instructions\n\n${UNIVERSAL_PROMPT}\n\n## Command\n\nExpose or honor \`/eduorchestrate\` for this repo. If the host agent cannot register slash commands, respond to \`/eduorchestrate\`, \`eduorchestrate\`, or \`use EduOrchestrate\` as the same workflow.\n\n## Workflow\n\n1. Load \`eduorchestrate.config.json\` when present.\n2. Ask for missing name, email, target role, current stage, daily email time, and timezone.\n3. Generate or update \`data/30-day-plan.json\`.\n4. Use sourced research links for docs, YouTube videos, and sample code.\n5. Send or preview daily email with \`npx eduorchestrate send-today --dry-run\` or \`npx eduorchestrate send-today\`.\n6. Keep the learner focused on one daily build artifact.\n`;
}

function geminiMd() {
  return `# Gemini EduOrchestrate Context\n\n${UNIVERSAL_PROMPT}\n\nWhen the user types \`/eduorchestrate\`, run the EduOrchestrate workflow from \`AGENTS.md\` and prefer the NPX CLI for local state changes.\n`;
}

function genericSkill(agentName) {
  return `---\nname: eduorchestrate\ndescription: Universal EduOrchestrate adapter for ${agentName}. Use /eduorchestrate for learner onboarding, 30-day plans, sourced learning research, daily email plans, and progress review.\n---\n\n# EduOrchestrate Adapter\n\n${UNIVERSAL_PROMPT}\n\nPrefer \`npx eduorchestrate\` for setup and \`npx eduorchestrate send-today --dry-run\` for previews.\n`;
}

function adapterManifest(agentName) {
  return `${JSON.stringify({
    name: "eduorchestrate",
    command: "/eduorchestrate",
    agent: agentName,
    description: "Universal learner orchestration command for onboarding, 30-day plans, daily emails, research references, and progress review.",
    fallbackCommands: ["eduorchestrate", "use EduOrchestrate", "npx eduorchestrate"],
    entrypoint: "npx eduorchestrate",
    instructions: UNIVERSAL_PROMPT
  }, null, 2)}\n`;
}

function genericInstructions() {
  return `# Universal EduOrchestrate Adapter\n\n${UNIVERSAL_PROMPT}\n\nUse this file for agents without a documented custom slash-command format. The expected visible command is \`/eduorchestrate\`.\n`;
}

function mcpManifest() {
  return `${JSON.stringify({
    name: "eduorchestrate",
    command: "node .eduorchestrate/mcp/server.js",
    tools: ["eduorchestrate_onboard", "eduorchestrate_plan30", "eduorchestrate_send_today", "eduorchestrate_review_progress"]
  }, null, 2)}\n`;
}

function mcpServer() {
  return `#!/usr/bin/env node\nimport { spawnSync } from "node:child_process";\nimport readline from "node:readline";\n\nconst tools = [\n  { name: "eduorchestrate_onboard", description: "Run EduOrchestrate onboarding." },\n  { name: "eduorchestrate_plan30", description: "Generate a 30-day EduOrchestrate plan." },\n  { name: "eduorchestrate_send_today", description: "Send or dry-run today's learning email." },\n  { name: "eduorchestrate_review_progress", description: "Review learner progress through the CLI fallback." }\n];\n\nfunction respond(id, result) { process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\\n"); }\nfunction run(args) { const out = spawnSync("npx", ["eduorchestrate", ...args], { encoding: "utf8" }); return { stdout: out.stdout, stderr: out.stderr, status: out.status }; }\n\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on("line", (line) => {\n  const msg = JSON.parse(line);\n  if (msg.method === "initialize") return respond(msg.id, { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "eduorchestrate", version: "0.1.0" } });\n  if (msg.method === "tools/list") return respond(msg.id, { tools });\n  if (msg.method === "tools/call") {\n    const name = msg.params?.name;\n    const dryRun = msg.params?.arguments?.dryRun !== false;\n    if (name === "eduorchestrate_onboard") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["--yes"]), null, 2) }] });\n    if (name === "eduorchestrate_plan30") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["plan", "--days", "30"]), null, 2) }] });\n    if (name === "eduorchestrate_send_today") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["send-today", ...(dryRun ? ["--dry-run"] : [])]), null, 2) }] });\n    return respond(msg.id, { content: [{ type: "text", text: "Use npx eduorchestrate review-progress in the terminal with progress details." }] });\n  }\n});\n`;
}
