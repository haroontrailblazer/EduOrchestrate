import fs from "node:fs";
import path from "node:path";
import { writeAgentAdapters } from "./adapters.js";
import { appendGitignore, loadConfig, loadEnvFile, readJson, resolveDataDir, saveConfig, writeJson, writeLocalEnv } from "./config.js";
import { createCoursePack, saveCoursePack } from "./courses.js";
import { sendMail, smtpConfigFromEnv } from "./email.js";
import { createHarness, saveHarness } from "./harness.js";
import { generate30DayPlan, renderDailyEmail } from "./planner.js";
import { buildProgressionCard, copyDefaultTerminalCard, saveProgressionCard } from "./progression-card.js";
import { appendProgress, createWeeklySummary, planStatus, reviewProgress } from "./progress.js";
import { collectOnboarding } from "./prompts.js";
import { appendResearchIndex, createResearchDigest, saveResearchDigest } from "./research.js";
import { writeGithubWorkflow } from "./workflow.js";

export async function main(argv = []) {
  const command = normalizeCommand(argv[0]);
  if (command === "send-today") return sendToday(argv.slice(1));
  if (command === "plan") return regeneratePlan(argv.slice(1));
  if (command === "status") return showStatus();
  if (command === "research") return research(argv.slice(1));
  if (command === "harness") return harness(argv.slice(1));
  if (command === "courses") return courses();
  if (command === "log-progress") return logProgress(argv.slice(1));
  if (command === "weekly-summary") return weeklySummary(argv.slice(1));
  if (command === "recommend-next") return recommendNext();
  if (command === "progress-card") return progressCard();
  if (command === "terminal-card") return terminalCard();
  if (command === "setup-secrets") return setupSecrets();
  if (command === "doctor") return doctor();
  if (command === "help") return printHelp();
  return init(argv);
}

function normalizeCommand(value) {
  if (!value || value === "/eduorchestrate" || value === "init") return "init";
  if (value === "--help" || value === "-h") return "help";
  return value;
}

async function init(argv) {
  const nonInteractive = argv.includes("--yes") || argv.includes("--non-interactive");
  const overrides = parseKeyValues(argv);
  const answers = await collectOnboarding({ nonInteractive, overrides });
  const config = {
    version: 1,
    command: "/eduorchestrate",
    dataDir: "data",
    learner: answers.learner,
    schedule: answers.schedule,
    email: {
      provider: "smtp",
      to: answers.learner.email,
      fromEnv: ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"]
    },
    agents: ["claude", "codex", "gemini", "openclaw", "antigravity", "hermas", "generic"]
  };
  saveConfig(config);
  appendGitignore(["__pycache__/", "*.py[cod]", ".pytest_cache/", "node_modules/", ".env.local", "data/"]);
  writeLocalEnv({
    SMTP_HOST: answers.smtp.host,
    SMTP_PORT: answers.smtp.port,
    SMTP_USER: answers.smtp.user,
    SMTP_PASS: answers.smtp.pass,
    SMTP_FROM: answers.smtp.from
  });
  const adapterFiles = writeAgentAdapters();
  const plan = generate30DayPlan(config.learner);
  writeJson(path.join(resolveDataDir(config), "30-day-plan.json"), plan);
  const defaultTerminalCard = copyDefaultTerminalCard(config);
  const cardPaths = saveProgressionCard(config, buildProgressionCard(config, plan));
  const harnessPaths = saveHarness(config, createHarness(config, plan, "init"));
  const coursePaths = saveCoursePack(config, createCoursePack(config, plan));
  const digest = createResearchDigest({ config, topic: plan.days[0].title, day: 1, roleKey: plan.roleKey });
  const digestPath = saveResearchDigest(config, digest);
  appendResearchIndex(config, digestPath, digest);
  const workflowPath = writeGithubWorkflow(config);
  console.log(JSON.stringify({
    status: "initialized",
    command: "/eduorchestrate",
    adapters: adapterFiles,
    plan: "data/30-day-plan.json",
    defaultTerminalCard,
    progressionCard: cardPaths.markdownPath,
    harness: harnessPaths.jsonPath,
    learningSources: coursePaths.jsonPath,
    workflow: path.relative(process.cwd(), workflowPath),
    firstResearchDigest: digestPath,
    next: "Run npx eduorchestrate send-today --dry-run to preview the first email."
  }, null, 2));
}

function regeneratePlan(argv) {
  const config = loadConfig();
  const roleArg = valueAfter(argv, "--role");
  if (roleArg) config.learner.targetRole = roleArg;
  const focusSkill = valueAfter(argv, "--skill") || valueAfter(argv, "--focus-skill");
  if (focusSkill) config.learner.focusSkill = focusSkill;
  const currentLearning = valueAfter(argv, "--current-learning");
  if (currentLearning) config.learner.currentLearning = currentLearning;
  const days = Number.parseInt(valueAfter(argv, "--days") || "", 10);
  if (days) config.learner.planDays = Math.max(30, days);
  const plan = generate30DayPlan(config.learner);
  writeJson(path.join(resolveDataDir(config), "30-day-plan.json"), plan);
  saveConfig(config);
  console.log(JSON.stringify({ status: "saved", plan: "data/30-day-plan.json", days: plan.days.length }, null, 2));
}

async function sendToday(argv) {
  const dryRun = argv.includes("--dry-run");
  const day = Number.parseInt(valueAfter(argv, "--day") || "1", 10);
  const config = loadConfig();
  const dataDir = resolveDataDir(config);
  const planPath = path.join(dataDir, "30-day-plan.json");
  const plan = fs.existsSync(planPath) ? JSON.parse(fs.readFileSync(planPath, "utf8")) : generate30DayPlan(config.learner);
  if (!fs.existsSync(planPath)) writeJson(planPath, plan);
  const progressReview = reviewProgress(config, plan);
  const progressionCard = buildProgressionCard(config, plan);
  saveProgressionCard(config, progressionCard);
  const coursePack = createCoursePack(config, plan);
  saveCoursePack(config, coursePack);
  const digest = createResearchDigest({
    config,
    topic: plan.days.find((entry) => entry.day === day)?.title || config.learner.targetRole,
    day,
    roleKey: plan.roleKey
  });
  const digestPath = saveResearchDigest(config, digest);
  appendResearchIndex(config, digestPath, digest);
  const env = { ...process.env, ...loadEnvFile(path.join(process.cwd(), ".env.local")) };
  const smtp = smtpConfigFromEnv(env);
  const message = renderDailyEmail(config, plan, day, { progressReview, researchDigest: digest, progressionCard, coursePack });
  const result = await sendMail({ smtp, message, dryRun });
  writeJson(path.join(dataDir, "latest-email.json"), { generatedAt: new Date().toISOString(), researchDigest: digestPath, ...result });
  console.log(JSON.stringify(result, null, 2));
}

function showStatus() {
  const config = loadConfig();
  const plan = loadOrCreatePlan(config);
  console.log(JSON.stringify(planStatus(config, plan), null, 2));
}

function research(argv) {
  const config = loadConfig();
  const plan = loadOrCreatePlan(config);
  const day = Number.parseInt(valueAfter(argv, "--day") || "1", 10);
  const topic = valueAfter(argv, "--topic") || plan.days.find((entry) => entry.day === day)?.title || config.learner.targetRole;
  const digest = createResearchDigest({ config, topic, day, roleKey: plan.roleKey });
  const digestPath = saveResearchDigest(config, digest);
  appendResearchIndex(config, digestPath, digest);
  console.log(JSON.stringify({ status: "saved", path: digestPath, digest }, null, 2));
}

function harness(argv) {
  const config = loadConfig();
  const plan = loadOrCreatePlan(config);
  const mode = valueAfter(argv, "--mode") || "daily";
  const payload = createHarness(config, plan, mode);
  const paths = saveHarness(config, payload);
  console.log(JSON.stringify({ status: "saved", ...paths, harness: payload }, null, 2));
}

function courses() {
  const config = loadConfig();
  const plan = loadOrCreatePlan(config);
  const pack = createCoursePack(config, plan);
  const paths = saveCoursePack(config, pack);
  console.log(JSON.stringify({ status: "saved", ...paths, learningSources: pack }, null, 2));
}

function logProgress(argv) {
  const config = loadConfig();
  const plan = loadOrCreatePlan(config);
  const entry = appendProgress(config, {
    day: valueAfter(argv, "--day"),
    completed: valueAfter(argv, "--completed"),
    evidence: valueAfter(argv, "--evidence"),
    minutes: valueAfter(argv, "--minutes"),
    confidence: valueAfter(argv, "--confidence"),
    blocker: valueAfter(argv, "--blocker")
  });
  const review = reviewProgress(config, plan);
  const cardPaths = saveProgressionCard(config, buildProgressionCard(config, plan));
  writeJson(path.join(resolveDataDir(config), "latest-review.json"), review);
  console.log(JSON.stringify({ status: "logged", entry, review, progressionCard: cardPaths.markdownPath }, null, 2));
}

function weeklySummary(argv) {
  const config = loadConfig();
  const plan = loadOrCreatePlan(config);
  const week = Number.parseInt(valueAfter(argv, "--week") || "1", 10);
  const summary = createWeeklySummary(config, plan, week);
  writeJson(path.join(resolveDataDir(config), `weekly-summary-${week}.json`), summary);
  console.log(JSON.stringify(summary, null, 2));
}

function recommendNext() {
  const config = loadConfig();
  const plan = loadOrCreatePlan(config);
  const review = reviewProgress(config, plan);
  const currentFocus = config.learner.focusSkill || plan.primarySkill;
  const recommendation = plan.nextSkillRecommendation || {
    afterDay: plan.days.length,
    currentFocus,
    recommendedNextSkill: "portfolio-level capstone improvement",
    reason: "Finish the current plan, then deepen the artifact with evaluation, deployment, and interview proof."
  };
  const payload = {
    generatedAt: new Date().toISOString(),
    canAdvance: review.completedDays >= plan.days.length,
    completedDays: review.completedDays,
    requiredDays: plan.days.length,
    currentFocus,
    ...recommendation
  };
  writeJson(path.join(resolveDataDir(config), "next-skill-recommendation.json"), payload);
  console.log(JSON.stringify(payload, null, 2));
}

function progressCard() {
  const config = loadConfig();
  const plan = loadOrCreatePlan(config);
  const card = buildProgressionCard(config, plan);
  const paths = saveProgressionCard(config, card);
  console.log(JSON.stringify({ status: "saved", ...paths, card }, null, 2));
}

function terminalCard() {
  const config = loadConfig();
  const plan = loadOrCreatePlan(config);
  const card = buildProgressionCard(config, plan);
  const paths = saveProgressionCard(config, card);
  console.log(JSON.stringify({
    status: "saved",
    terminalSvgPath: paths.terminalSvgPath,
    terminalLines: card.terminalLines
  }, null, 2));
}

function setupSecrets() {
  const config = loadConfig();
  const env = loadEnvFile(path.join(process.cwd(), ".env.local"));
  const commands = [
    secretCommand("SMTP_HOST", env.SMTP_HOST || "<smtp-host>"),
    secretCommand("SMTP_PORT", env.SMTP_PORT || "465"),
    secretCommand("SMTP_USER", env.SMTP_USER || "<smtp-user>"),
    "gh secret set SMTP_PASS",
    secretCommand("SMTP_FROM", env.SMTP_FROM || config.email.to)
  ];
  console.log(JSON.stringify({
    status: "manual-secret-commands",
    note: "Run these after gh auth login. Secrets are not committed.",
    commands
  }, null, 2));
}

function secretCommand(key, value) {
  return `gh secret set ${key} --body "${String(value).replace(/"/g, '\\"')}"`;
}

function doctor() {
  const checks = {
    packageJson: fs.existsSync(path.join(process.cwd(), "package.json")),
    skill: fs.existsSync(path.join(process.cwd(), "skills", "eduorchestrate", "SKILL.md")),
    agentsMd: fs.existsSync(path.join(process.cwd(), "AGENTS.md")),
    geminiMd: fs.existsSync(path.join(process.cwd(), "GEMINI.md")),
    claudeSkill: fs.existsSync(path.join(process.cwd(), ".claude", "skills", "eduorchestrate", "SKILL.md")),
    mcpManifest: fs.existsSync(path.join(process.cwd(), ".eduorchestrate", "mcp", "manifest.json")),
    config: fs.existsSync(path.join(process.cwd(), "eduorchestrate.config.json")),
    localEnv: fs.existsSync(path.join(process.cwd(), ".env.local"))
  };
  console.log(JSON.stringify({ status: Object.values(checks).every(Boolean) ? "ready" : "needs-setup", checks }, null, 2));
}

function printHelp() {
  console.log(`EduOrchestrate

Commands:
  npx eduorchestrate                         Run one-command onboarding
  npx eduorchestrate /eduorchestrate          Same as onboarding
  npx eduorchestrate plan --role "Agentic AI and LLM Engineer"
  npx eduorchestrate plan --days 45 --skill "RAG evaluation"
  npx eduorchestrate status
  npx eduorchestrate harness
  npx eduorchestrate courses
  npx eduorchestrate research --day 1
  npx eduorchestrate send-today --dry-run
  npx eduorchestrate log-progress --day 1 --completed "Built setup" --evidence "Repo link"
  npx eduorchestrate weekly-summary --week 1
  npx eduorchestrate recommend-next
  npx eduorchestrate progress-card
  npx eduorchestrate terminal-card
  npx eduorchestrate setup-secrets
  npx eduorchestrate doctor
`);
}

function parseKeyValues(argv) {
  const map = {
    "--name": "name",
    "--email": "email",
    "--role": "targetRole",
    "--target-role": "targetRole",
    "--current-learning": "currentLearning",
    "--skill": "focusSkill",
    "--focus-skill": "focusSkill",
    "--stage": "currentStage",
    "--current-stage": "currentStage",
    "--weekly-hours": "weeklyHours",
    "--days": "planDays",
    "--time": "dailyEmailTime",
    "--timezone": "timezone",
    "--smtp-host": "smtpHost",
    "--smtp-port": "smtpPort",
    "--smtp-user": "smtpUser",
    "--smtp-pass": "smtpPass",
    "--smtp-from": "smtpFrom"
  };
  const overrides = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = map[argv[index]];
    if (key && argv[index + 1]) overrides[key] = argv[index + 1];
  }
  return overrides;
}

function valueAfter(argv, flag) {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

function loadOrCreatePlan(config) {
  const planPath = path.join(resolveDataDir(config), "30-day-plan.json");
  const existing = readJson(planPath);
  if (existing) return existing;
  const plan = generate30DayPlan(config.learner);
  writeJson(planPath, plan);
  return plan;
}
