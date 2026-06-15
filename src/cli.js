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
import { appendResearchIndex, createResearchDigest, enrichDigestLinks, saveResearchDigest } from "./research.js";
import { writeGithubWorkflow } from "./workflow.js";

export async function main(argv = []) {
  const command = normalizeCommand(argv[0]);
  if (command === "send-today") return sendToday(argv.slice(1));
  if (command === "plan") return regeneratePlan(argv.slice(1));
  if (command === "status") return showStatus();
  if (command === "research") return research(argv.slice(1));
  if (command === "links") return links(argv.slice(1));
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
  config.schedule.startDate = localDateString(new Date(), config.schedule.timezone);
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
  writeDataJson(config, "30-day-plan.json", plan);
  const defaultTerminalCard = copyDefaultTerminalCard(config);
  const cardPaths = saveProgressionCard(config, buildProgressionCard(config, plan));
  const harnessPaths = saveHarness(config, createHarness(config, plan, "init"));
  const coursePaths = saveCoursePack(config, createCoursePack(config, plan));
  const digest = createResearchDigest({ config, topic: plan.days[0].title, day: 1, roleKey: plan.roleKey });
  await enrichDigestLinks(digest, { offline: argv.includes("--offline") });
  const digestPath = saveResearchDigest(config, digest);
  appendResearchIndex(config, digestPath, digest);
  const workflowPath = writeGithubWorkflow(config);
  outputJson({
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
  });
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
  writeDataJson(config, "30-day-plan.json", plan);
  saveConfig(config);
  outputJson({ status: "saved", plan: "data/30-day-plan.json", days: plan.days.length });
}

async function sendToday(argv) {
  const dryRun = argv.includes("--dry-run");
  const explicitDay = valueAfter(argv, "--day");
  const { config, plan } = loadRuntime();
  const day = explicitDay ? parsePositiveDay(explicitDay, plan) : resolveScheduledDay(config, plan);
  if (!explicitDay && day > plan.days.length) {
    const result = {
      skipped: true,
      reason: "plan-complete",
      day,
      planDays: plan.days.length,
      recommendation: plan.nextSkillRecommendation
    };
    writeDataJson(config, "latest-email.json", { generatedAt: new Date().toISOString(), ...result });
    outputJson(result);
    return;
  }
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
  await enrichDigestLinks(digest, { offline: argv.includes("--offline") });
  const digestPath = saveResearchDigest(config, digest);
  appendResearchIndex(config, digestPath, digest);
  const env = { ...process.env, ...loadEnvFile(path.join(process.cwd(), ".env.local")) };
  const smtp = smtpConfigFromEnv(env);
  const message = renderDailyEmail(config, plan, day, { progressReview, researchDigest: digest, progressionCard, coursePack });
  const result = await sendMail({ smtp, message, dryRun });
  writeDataJson(config, "latest-email.json", { generatedAt: new Date().toISOString(), researchDigest: digestPath, ...result });
  outputJson(result);
}

export function resolveScheduledDay(config, plan, now = new Date()) {
  const startDate = config.schedule?.startDate;
  if (!startDate) return 1;
  const today = localDateString(now, config.schedule?.timezone);
  const elapsedDays = daysBetweenDateStrings(startDate, today);
  const day = elapsedDays + 1;
  return Number.isFinite(day) ? Math.max(1, day) : 1;
}

function showStatus() {
  const { config, plan } = loadRuntime();
  outputJson(planStatus(config, plan));
}

async function research(argv) {
  const { config, plan } = loadRuntime();
  const day = Number.parseInt(valueAfter(argv, "--day") || "1", 10);
  const topic = valueAfter(argv, "--topic") || plan.days.find((entry) => entry.day === day)?.title || config.learner.targetRole;
  const digest = createResearchDigest({ config, topic, day, roleKey: plan.roleKey });
  await enrichDigestLinks(digest, { offline: argv.includes("--offline") });
  const digestPath = saveResearchDigest(config, digest);
  appendResearchIndex(config, digestPath, digest);
  outputJson({ status: "saved", path: digestPath, digest });
}

async function links(argv) {
  const { config, plan } = loadRuntime();
  const day = Number.parseInt(valueAfter(argv, "--day") || "1", 10);
  const topic = valueAfter(argv, "--topic") || plan.days.find((entry) => entry.day === day)?.title || config.learner.targetRole;
  const digest = createResearchDigest({ config, topic, day, roleKey: plan.roleKey });
  await enrichDigestLinks(digest, { offline: argv.includes("--offline"), limit: 3 });
  const payload = {
    generatedAt: new Date().toISOString(),
    day,
    topic,
    liveResolved: digest.liveResolved,
    topVideo: digest.topVideo,
    topRepo: digest.topRepo,
    topDoc: digest.topDoc,
    videos: digest.videos || [],
    repos: digest.repos || []
  };
  writeDataJson(config, "links.json", payload);
  outputJson({ status: "resolved", path: "data/links.json", ...payload });
}

function harness(argv) {
  const { config, plan } = loadRuntime();
  const mode = valueAfter(argv, "--mode") || "daily";
  const payload = createHarness(config, plan, mode);
  const paths = saveHarness(config, payload);
  outputJson({ status: "saved", ...paths, harness: payload });
}

function courses() {
  const { config, plan } = loadRuntime();
  const pack = createCoursePack(config, plan);
  const paths = saveCoursePack(config, pack);
  outputJson({ status: "saved", ...paths, learningSources: pack });
}

function logProgress(argv) {
  const { config, plan } = loadRuntime();
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
  writeDataJson(config, "latest-review.json", review);
  outputJson({ status: "logged", entry, review, progressionCard: cardPaths.markdownPath });
}

function weeklySummary(argv) {
  const { config, plan } = loadRuntime();
  const week = Number.parseInt(valueAfter(argv, "--week") || "1", 10);
  const summary = createWeeklySummary(config, plan, week);
  writeDataJson(config, `weekly-summary-${week}.json`, summary);
  outputJson(summary);
}

function recommendNext() {
  const { config, plan } = loadRuntime();
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
  writeDataJson(config, "next-skill-recommendation.json", payload);
  outputJson(payload);
}

function progressCard() {
  const { config, plan } = loadRuntime();
  const card = buildProgressionCard(config, plan);
  const paths = saveProgressionCard(config, card);
  outputJson({ status: "saved", ...paths, card });
}

function terminalCard() {
  const { config, plan } = loadRuntime();
  const card = buildProgressionCard(config, plan);
  const paths = saveProgressionCard(config, card);
  outputJson({
    status: "saved",
    terminalSvgPath: paths.terminalSvgPath,
    terminalLines: card.terminalLines
  });
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
  outputJson({
    status: "manual-secret-commands",
    note: "Run these after gh auth login. Secrets are not committed.",
    commands
  });
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
  outputJson({ status: Object.values(checks).every(Boolean) ? "ready" : "needs-setup", checks });
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
  npx eduorchestrate links --day 1
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

function parsePositiveDay(value, plan) {
  if (!/^\d+$/.test(String(value || ""))) throw new Error(`Invalid day: ${value}`);
  const day = Number.parseInt(value, 10);
  if (!Number.isInteger(day) || day < 1) throw new Error(`Invalid day: ${value}`);
  if (plan?.days?.length && day > plan.days.length) throw new Error(`Day ${day} is outside this ${plan.days.length}-day plan.`);
  return day;
}

function localDateString(date = new Date(), timezone = "UTC") {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone || "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function daysBetweenDateStrings(startDate, endDate) {
  const start = dateStringToUtc(startDate);
  const end = dateStringToUtc(endDate);
  return Math.floor((end.getTime() - start.getTime()) / 86400000);
}

function dateStringToUtc(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!match) return new Date(Number.NaN);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return new Date(Number.NaN);
  }
  return date;
}

function loadRuntime() {
  const config = loadConfig();
  return { config, plan: loadOrCreatePlan(config) };
}

function loadOrCreatePlan(config) {
  const planPath = path.join(resolveDataDir(config), "30-day-plan.json");
  const existing = readJson(planPath);
  if (hasPlanDays(existing)) return existing;
  const plan = generate30DayPlan(config.learner);
  writeJson(planPath, plan);
  return plan;
}

function hasPlanDays(plan) {
  return Array.isArray(plan?.days) && plan.days.length > 0;
}

function writeDataJson(config, fileName, payload) {
  writeJson(path.join(resolveDataDir(config), fileName), payload);
}

function outputJson(payload) {
  console.log(JSON.stringify(payload, null, 2));
}
