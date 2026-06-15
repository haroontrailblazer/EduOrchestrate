import fs from "node:fs";
import path from "node:path";
import { ensureDir } from "./config.js";

const MAIL_RESUME_POLICY = `Mail resume policy: apply this to every supported agent, not only Codex. When an agent runs in a resumable browser or workspace instance, treat each resume as a daily-mail checkpoint: load the harness or status, resolve the current plan day, and run npx eduorchestrate send-today for the due day after SMTP setup. If SMTP secrets are missing or real sending has not been approved, run npx eduorchestrate send-today --dry-run and ask before sending. GitHub Actions remains the scheduled no-browser path.`;

const UNIVERSAL_PROMPT = `Use /eduorchestrate as the learner command. When invoked, load the EduOrchestrate workflow and its prebuilt terminal-card program; never recreate, type out, or hand-design the card UI in the agent prompt. Ask for missing learner profile details, ask what the learner is currently studying, ask the first skill they want to focus on, generate or update an adaptive plan with a fixed 30-day minimum, research current and trending references, send or preview daily emails, log progress, load the bundled default card or CLI-produced card artifact, summarize the week, recommend the next skill after the plan window, and keep recommendations practical, sourced, and focused. Research resolves a concrete top video link (digest.topVideo.url) and top GitHub repo (digest.topRepo.url) so the daily email carries a watchable link, not only search queries; on network failure it falls back to search URLs, and --offline or EDUORCHESTRATE_OFFLINE=1 skips resolution. The dependency-free mailer supports implicit TLS (port 465) and STARTTLS (port 587). ${MAIL_RESUME_POLICY} If native slash commands are unavailable, treat "eduorchestrate" or "use EduOrchestrate" as equivalent to /eduorchestrate.`;

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

function cliExamples() {
  return `npx eduorchestrate
npx eduorchestrate harness
npx eduorchestrate courses
npx eduorchestrate status
npx eduorchestrate research --day 1
npx eduorchestrate send-today --dry-run
npx eduorchestrate log-progress --day 1 --completed "Built setup" --evidence "Repo link"
npx eduorchestrate weekly-summary --week 1
npx eduorchestrate progress-card
npx eduorchestrate terminal-card
npx eduorchestrate recommend-next`;
}

function claudeSkill() {
  return `---\nname: eduorchestrate\ndescription: Use /eduorchestrate to onboard a learner, create an adaptive job-role plan with a 30-day minimum, research trends, send daily plan emails, log progress, load the prebuilt skill progression card, summarize weeks, recommend the next skill, and review progress.\n---\n\n# EduOrchestrate\n\n${UNIVERSAL_PROMPT}\n\nRun local commands when needed:\n\n\`\`\`bash\n${cliExamples()}\n\`\`\`\n`;
}

function agentsMd() {
  return `# EduOrchestrate Agent Instructions\n\n${UNIVERSAL_PROMPT}\n\n## Command\n\nExpose or honor \`/eduorchestrate\` for this repo. If the host agent cannot register slash commands, respond to \`/eduorchestrate\`, \`eduorchestrate\`, or \`use EduOrchestrate\` as the same workflow.\n\n## Workflow\n\n1. Load \`eduorchestrate.config.json\` when present.\n2. Ask for missing name, email, target role, current learning topic, first skill focus, current stage, desired plan days, daily email time, and timezone.\n3. Generate or update \`data/30-day-plan.json\`; never generate fewer than 30 days.\n4. Use \`npx eduorchestrate research --day <n>\` for sourced docs, trend scans, YouTube search, and GitHub sample-code search links.\n5. Send or preview daily email with \`npx eduorchestrate send-today --dry-run\` or \`npx eduorchestrate send-today\`; browser/workspace agents must check and send the due daily mail on resume after SMTP setup, while GitHub Actions remains the scheduled no-browser path.\n6. Log evidence with \`npx eduorchestrate log-progress --day <n> --completed "..." --evidence "..."\`.\n7. Do not create or type card UI in the agent. Use the prebuilt default card at \`skills/eduorchestrate/assets/default-terminal-card.svg\` or the initialized copy at \`data/default-terminal-card.svg\`.\n8. Load the compact execution harness with \`npx eduorchestrate harness\` before doing research, mail, progress, or review work.\n9. Use \`npx eduorchestrate courses\` for role-specific official/MNC course catalogs, free-course discovery links, and newsletters; do not default to Coursera or Udemy.\n10. When learner-specific state is needed, call the prebuilt CLI program with \`npx eduorchestrate progress-card\` or \`npx eduorchestrate terminal-card\`; then load \`data/progression-card.md\` or \`data/terminal-card.svg\`.\n11. Summarize with \`npx eduorchestrate status\` and \`npx eduorchestrate weekly-summary --week <n>\`.\n12. Recommend the next skill after the plan with \`npx eduorchestrate recommend-next\`.\n13. Keep the learner focused on one daily build artifact.\n`;
}

function geminiMd() {
  return `# Gemini EduOrchestrate Context\n\n${UNIVERSAL_PROMPT}\n\nWhen the user types \`/eduorchestrate\`, run the EduOrchestrate workflow from \`AGENTS.md\` and prefer the NPX CLI for local state changes.\n`;
}

function genericSkill(agentName) {
  return `---\nname: eduorchestrate\ndescription: Universal EduOrchestrate adapter for ${agentName}. Use /eduorchestrate for learner onboarding, adaptive plans with a 30-day minimum, trend research, daily email plans, progress logging, prebuilt skill progression cards, weekly summaries, and next-skill recommendations.\n---\n\n# EduOrchestrate Adapter\n\n${UNIVERSAL_PROMPT}\n\nPrefer:\n\n\`\`\`bash\n${cliExamples()}\n\`\`\`\n`;
}

function adapterManifest(agentName) {
  return `${JSON.stringify({
    name: "eduorchestrate",
    command: "/eduorchestrate",
    agent: agentName,
    description: "Universal learner orchestration command for onboarding, adaptive plans with a 30-day minimum, trend research, daily emails, progress logging, prebuilt GitHub-style progression cards, weekly summaries, next-skill recommendations, setup diagnostics, and review.",
    fallbackCommands: ["eduorchestrate", "use EduOrchestrate", "npx eduorchestrate"],
    entrypoint: "npx eduorchestrate",
    capabilities: ["onboarding", "token-conscious-harness", "role-course-sources", "adaptive-plan-minimum-30-days", "first-skill-focus", "trend-research-digest", "resolved-top-video-link", "resolved-top-repo-link", "daily-email", "implicit-tls-and-starttls-mail", "progress-log", "progression-card", "terminal-card-svg", "weekly-summary", "next-skill-recommendation", "setup-diagnostics"],
    instructions: UNIVERSAL_PROMPT
  }, null, 2)}\n`;
}

function genericInstructions() {
  return `# Universal EduOrchestrate Adapter\n\n${UNIVERSAL_PROMPT}\n\nUse this file for agents without a documented custom slash-command format. The expected visible command is \`/eduorchestrate\`.\n\n\`\`\`bash\n${cliExamples()}\n\`\`\`\n`;
}

function mcpManifest() {
  return `${JSON.stringify({
    name: "eduorchestrate",
    command: "node .eduorchestrate/mcp/server.js",
    tools: ["eduorchestrate_onboard", "eduorchestrate_harness", "eduorchestrate_courses", "eduorchestrate_plan30", "eduorchestrate_research", "eduorchestrate_links", "eduorchestrate_send_today", "eduorchestrate_log_progress", "eduorchestrate_progress_card", "eduorchestrate_terminal_card", "eduorchestrate_weekly_summary", "eduorchestrate_recommend_next", "eduorchestrate_status"]
  }, null, 2)}\n`;
}

function mcpServer() {
  return `#!/usr/bin/env node\nimport { spawnSync } from "node:child_process";\nimport readline from "node:readline";\n\nconst tools = [\n  { name: "eduorchestrate_onboard", description: "Run EduOrchestrate onboarding." },\n  { name: "eduorchestrate_harness", description: "Create the compact token-conscious execution harness." },\n  { name: "eduorchestrate_courses", description: "Create role-specific official course, free learning, and newsletter source pack." },\n  { name: "eduorchestrate_plan30", description: "Generate a 30-day-minimum EduOrchestrate plan." },\n  { name: "eduorchestrate_research", description: "Create a sourced trend research digest for a day or topic." },\n  { name: "eduorchestrate_links", description: "Resolve and persist today's top video, repo, and doc links." },\n  { name: "eduorchestrate_send_today", description: "Send or dry-run today's learning email." },\n  { name: "eduorchestrate_log_progress", description: "Log learner progress evidence." },\n  { name: "eduorchestrate_progress_card", description: "Run the prebuilt program that writes the role, skill, GitHub-style progression, and terminal card artifacts." },\n  { name: "eduorchestrate_terminal_card", description: "Run the prebuilt program that writes the exact SVG terminal-card artifact." },\n  { name: "eduorchestrate_weekly_summary", description: "Summarize a learning week." },\n  { name: "eduorchestrate_recommend_next", description: "Recommend the next skill after the current plan window." },\n  { name: "eduorchestrate_status", description: "Show current plan and momentum status." }\n];\n\nfunction respond(id, result) { process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\\n"); }\nfunction run(args) { const out = spawnSync("npx", ["eduorchestrate", ...args], { encoding: "utf8" }); return { stdout: out.stdout, stderr: out.stderr, status: out.status }; }\n\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on("line", (line) => {\n  const msg = JSON.parse(line);\n  if (msg.method === "initialize") return respond(msg.id, { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "eduorchestrate", version: "0.3.0" } });\n  if (msg.method === "tools/list") return respond(msg.id, { tools });\n  if (msg.method === "tools/call") {\n    const name = msg.params?.name;\n    const args = msg.params?.arguments || {};\n    const dryRun = args.dryRun !== false;\n    if (name === "eduorchestrate_onboard") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["--yes"]), null, 2) }] });\n    if (name === "eduorchestrate_harness") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["harness", "--mode", args.mode || "daily"]), null, 2) }] });\n    if (name === "eduorchestrate_courses") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["courses"]), null, 2) }] });\n    if (name === "eduorchestrate_plan30") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["plan", "--days", String(Math.max(30, Number(args.days || 30)))]), null, 2) }] });\n    if (name === "eduorchestrate_research") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["research", "--day", String(args.day || 1), ...(args.topic ? ["--topic", args.topic] : [])]), null, 2) }] });\n    if (name === "eduorchestrate_links") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["links", "--day", String(args.day || 1), ...(args.topic ? ["--topic", args.topic] : [])]), null, 2) }] });\n    if (name === "eduorchestrate_send_today") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["send-today", ...(dryRun ? ["--dry-run"] : [])]), null, 2) }] });\n    if (name === "eduorchestrate_log_progress") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["log-progress", "--day", String(args.day || 1), "--completed", args.completed || "Completed today's task", "--evidence", args.evidence || "Evidence not provided"]), null, 2) }] });\n    if (name === "eduorchestrate_progress_card") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["progress-card"]), null, 2) }] });\n    if (name === "eduorchestrate_terminal_card") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["terminal-card"]), null, 2) }] });\n    if (name === "eduorchestrate_weekly_summary") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["weekly-summary", "--week", String(args.week || 1)]), null, 2) }] });\n    if (name === "eduorchestrate_recommend_next") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["recommend-next"]), null, 2) }] });\n    if (name === "eduorchestrate_status") return respond(msg.id, { content: [{ type: "text", text: JSON.stringify(run(["status"]), null, 2) }] });\n  }\n});\n`;
}
