import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderSvg, TerminalCardSvg } from "./card-components.js";
import { readJson, resolveDataDir, writeJson } from "./config.js";
import { reviewProgress } from "./progress.js";

const DEFAULT_TERMINAL_CARD = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "skills",
  "eduorchestrate",
  "assets",
  "default-terminal-card.svg"
);

export function buildProgressionCard(config, plan) {
  const dataDir = resolveDataDir(config);
  const progress = readJson(path.join(dataDir, "progress-log.json"), []);
  const review = reviewProgress(config, plan);
  const completedDays = new Set(progress.map((entry) => entry.day));
  const totalDays = plan.days.length || 30;
  const activeDay = Math.min(totalDays, Math.max(1, review.activeDay || 1));
  const activePlanDay = plan.days.find((day) => day.day === activeDay) || plan.days[0];
  const latest = progress.at(-1) || null;
  const grid = buildCommitGrid(totalDays, completedDays, activeDay);
  const terminalLines = [
    "$ npx eduorchestrate status",
    `role="${config.learner.targetRole}"`,
    `skill="${plan.primarySkill || config.learner.focusSkill || activePlanDay.primarySkill}"`,
    `progress="${completedDays.size}/${totalDays} days"`,
    `current_day="${activeDay}: ${activePlanDay.title}"`,
    `next_action="${review.nextAction}"`,
    latest ? `latest_evidence="${latest.evidence}"` : "latest_evidence=\"not logged yet\"",
    `momentum="${review.momentum}"`
  ];

  return {
    generatedAt: new Date().toISOString(),
    command: "/eduorchestrate",
    role: config.learner.targetRole,
    skill: plan.primarySkill || config.learner.focusSkill || activePlanDay.primarySkill,
    currentLearning: config.learner.currentLearning || "not specified",
    completedDays: completedDays.size,
    totalDays,
    activeDay,
    activeTopic: activePlanDay.title,
    grid,
    terminalLines,
    terminalSvg: renderTerminalSvg(terminalLines),
    markdown: renderMarkdownCard({
      config,
      plan,
      review,
      grid,
      terminalLines,
      activePlanDay,
      latest,
      completedDays: completedDays.size,
      totalDays
    })
  };
}

export function saveProgressionCard(config, card) {
  const dataDir = resolveDataDir(config);
  const jsonPath = path.join(dataDir, "progression-card.json");
  const markdownPath = path.join(dataDir, "progression-card.md");
  const terminalSvgPath = path.join(dataDir, "terminal-card.svg");
  writeJson(jsonPath, card);
  fs.writeFileSync(markdownPath, `${card.markdown}\n`, "utf8");
  fs.writeFileSync(terminalSvgPath, `${card.terminalSvg}\n`, "utf8");
  return {
    jsonPath: path.relative(process.cwd(), jsonPath),
    markdownPath: path.relative(process.cwd(), markdownPath),
    terminalSvgPath: path.relative(process.cwd(), terminalSvgPath)
  };
}

export function copyDefaultTerminalCard(config) {
  const dataDir = resolveDataDir(config);
  const targetPath = path.join(dataDir, "default-terminal-card.svg");
  fs.mkdirSync(dataDir, { recursive: true });
  fs.copyFileSync(DEFAULT_TERMINAL_CARD, targetPath);
  return path.relative(process.cwd(), targetPath);
}

function renderMarkdownCard({ config, plan, review, grid, terminalLines, activePlanDay, latest, completedDays, totalDays }) {
  const percent = Math.round((completedDays / totalDays) * 100);
  return [
    `# ${config.learner.targetRole}`,
    "",
    `## ${plan.primarySkill || activePlanDay.primarySkill}`,
    "",
    `Current learning: ${config.learner.currentLearning || "not specified"}`,
    `Progress: ${completedDays}/${totalDays} days (${percent}%)`,
    `Active day: ${activePlanDay.day} - ${activePlanDay.title}`,
    "",
    "GitHub-style learning progression:",
    "",
    "```text",
    grid.join("\n"),
    "```",
    "",
    "Legend: `#` completed, `>` active, `.` upcoming",
    "",
    "Terminal card:",
    "",
    "```bash",
    terminalLines.join("\n"),
    "```",
    "",
    `Next build: ${review.nextAction}`,
    `Latest proof: ${latest?.evidence || "not logged yet"}`,
    "",
    "Use `/eduorchestrate` to update the plan, log progress, or get the next action."
  ].join("\n");
}

function buildCommitGrid(totalDays, completedDays, activeDay) {
  const rows = [];
  for (let start = 1; start <= totalDays; start += 7) {
    const end = Math.min(totalDays, start + 6);
    const cells = [];
    for (let day = start; day <= end; day += 1) {
      if (completedDays.has(day)) cells.push("#");
      else if (day === activeDay) cells.push(">");
      else cells.push(".");
    }
    rows.push(`${String(start).padStart(2, "0")}-${String(end).padStart(2, "0")} ${cells.join(" ")}`);
  }
  return rows;
}

function renderTerminalSvg(lines) {
  return renderSvg(TerminalCardSvg({ lines }));
}
