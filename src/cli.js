import fs from "node:fs";
import path from "node:path";
import { writeAgentAdapters } from "./adapters.js";
import { appendGitignore, loadConfig, loadEnvFile, resolveDataDir, saveConfig, writeJson, writeLocalEnv } from "./config.js";
import { sendMail, smtpConfigFromEnv } from "./email.js";
import { generate30DayPlan, renderDailyEmail } from "./planner.js";
import { collectOnboarding } from "./prompts.js";
import { writeGithubWorkflow } from "./workflow.js";

export async function main(argv = []) {
  const command = normalizeCommand(argv[0]);
  if (command === "send-today") return sendToday(argv.slice(1));
  if (command === "plan") return regeneratePlan(argv.slice(1));
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
  const workflowPath = writeGithubWorkflow(config);
  console.log(JSON.stringify({
    status: "initialized",
    command: "/eduorchestrate",
    adapters: adapterFiles,
    plan: "data/30-day-plan.json",
    workflow: path.relative(process.cwd(), workflowPath),
    next: "Run npx eduorchestrate send-today --dry-run to preview the first email."
  }, null, 2));
}

function regeneratePlan(argv) {
  const config = loadConfig();
  const roleArg = valueAfter(argv, "--role");
  if (roleArg) config.learner.targetRole = roleArg;
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
  const env = { ...process.env, ...loadEnvFile(path.join(process.cwd(), ".env.local")) };
  const smtp = smtpConfigFromEnv(env);
  const message = renderDailyEmail(config, plan, day);
  const result = await sendMail({ smtp, message, dryRun });
  writeJson(path.join(dataDir, "latest-email.json"), { generatedAt: new Date().toISOString(), ...result });
  console.log(JSON.stringify(result, null, 2));
}

function printHelp() {
  console.log(`EduOrchestrate\n\nCommands:\n  npx eduorchestrate                Run one-command onboarding\n  npx eduorchestrate /eduorchestrate Same as onboarding\n  npx eduorchestrate plan --role "Agentic AI and LLM Engineer"\n  npx eduorchestrate send-today --dry-run\n`);
}

function parseKeyValues(argv) {
  const map = {
    "--name": "name",
    "--email": "email",
    "--role": "targetRole",
    "--target-role": "targetRole",
    "--stage": "currentStage",
    "--current-stage": "currentStage",
    "--weekly-hours": "weeklyHours",
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
