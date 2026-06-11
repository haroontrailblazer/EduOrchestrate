import fs from "node:fs";
import path from "node:path";
import { resolveDataDir, writeJson } from "./config.js";

export function createHarness(config, plan, mode = "daily") {
  const activeDay = plan.days[0] || {};
  return {
    generatedAt: new Date().toISOString(),
    command: "/eduorchestrate",
    mode,
    goal: "Run EduOrchestrate with low prompt overhead while preserving research, email, progress, and card behavior.",
    tokenPolicy: {
      loadFirst: ["data/eduorchestrate-harness.json", "eduorchestrate.config.json", "data/30-day-plan.json"],
      avoidLoadingUnlessNeeded: ["data/research-digests/*.json", "data/progression-card.json", "skills/eduorchestrate/assets/default-terminal-card.svg"],
      neverPaste: ["SVG contents", "SMTP secrets", "full research history", "full 30-day plan when only today is needed"],
      responseShape: "Return one next action, one reason, and the command or artifact path used."
    },
    executionOrder: [
      "Read this harness.",
      "Load config and only the active day from data/30-day-plan.json.",
      "Call CLI commands for stateful work; do not recreate CLI output manually.",
      "Persist outputs to data/ and summarize only the useful result."
    ],
    cardPolicy: {
      defaultCard: "skills/eduorchestrate/assets/default-terminal-card.svg",
      initializedCopy: "data/default-terminal-card.svg",
      learnerSpecificCard: "data/terminal-card.svg",
      rule: "Never create, type, or redesign the card UI in the agent. Load the prebuilt asset or run npx eduorchestrate terminal-card."
    },
    researchPolicy: {
      command: "npx eduorchestrate research --day <n>",
      keepEffectiveness: [
        "Use official docs and reputable sources first.",
        "Use YouTube and GitHub as search entry points, not unverified recommendations.",
        "Research only current or role-changing topics deeply; keep fundamentals concise.",
        "Persist the digest and cite artifact paths instead of pasting long source lists."
      ],
      maxInlineSources: 5
    },
    emailPolicy: {
      previewCommand: "npx eduorchestrate send-today --dry-run",
      sendCommand: "npx eduorchestrate send-today",
      rule: "Preview before send unless the user explicitly asks to send. Never expose SMTP_PASS."
    },
    progressPolicy: {
      logCommand: "npx eduorchestrate log-progress --day <n> --completed \"...\" --evidence \"...\"",
      statusCommand: "npx eduorchestrate status",
      weeklyCommand: "npx eduorchestrate weekly-summary --week <n>",
      nextSkillCommand: "npx eduorchestrate recommend-next"
    },
    activeDay: {
      day: activeDay.day || 1,
      title: activeDay.title || "Start",
      primarySkill: plan.primarySkill,
      task: activeDay.setupOrBuildTask || "Initialize the learner plan.",
      references: (activeDay.references || []).slice(0, 4)
    },
    artifacts: {
      plan: "data/30-day-plan.json",
      harness: "data/eduorchestrate-harness.json",
      harnessMarkdown: "data/eduorchestrate-harness.md",
      researchIndex: "data/research-index.json",
      progressLog: "data/progress-log.json",
      latestEmail: "data/latest-email.json",
      progressionCard: "data/progression-card.md",
      terminalCard: "data/terminal-card.svg"
    }
  };
}

export function saveHarness(config, harness) {
  const dataDir = resolveDataDir(config);
  const jsonPath = path.join(dataDir, "eduorchestrate-harness.json");
  const markdownPath = path.join(dataDir, "eduorchestrate-harness.md");
  writeJson(jsonPath, harness);
  writeText(markdownPath, renderHarnessMarkdown(harness));
  return {
    jsonPath: path.relative(process.cwd(), jsonPath),
    markdownPath: path.relative(process.cwd(), markdownPath)
  };
}

function renderHarnessMarkdown(harness) {
  return [
    "# EduOrchestrate Harness",
    "",
    `Mode: ${harness.mode}`,
    "",
    "## Token Policy",
    ...harness.tokenPolicy.loadFirst.map((item) => `- Load first: ${item}`),
    ...harness.tokenPolicy.neverPaste.map((item) => `- Never paste: ${item}`),
    "",
    "## Active Day",
    `- Day: ${harness.activeDay.day}`,
    `- Topic: ${harness.activeDay.title}`,
    `- Skill: ${harness.activeDay.primarySkill}`,
    `- Task: ${harness.activeDay.task}`,
    "",
    "## Commands",
    `- Research: ${harness.researchPolicy.command}`,
    `- Email preview: ${harness.emailPolicy.previewCommand}`,
    `- Email send: ${harness.emailPolicy.sendCommand}`,
    `- Progress: ${harness.progressPolicy.logCommand}`,
    `- Card: npx eduorchestrate terminal-card`,
    "",
    "## Card Rule",
    harness.cardPolicy.rule
  ].join("\n");
}

function writeText(filePath, text) {
  fs.writeFileSync(filePath, `${text}\n`, "utf8");
}
