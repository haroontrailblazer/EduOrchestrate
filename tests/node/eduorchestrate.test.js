import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { main, resolveScheduledDay } from "../../src/cli.js";
import { generate30DayPlan, renderDailyEmail } from "../../src/planner.js";
import { cronFromTime } from "../../src/workflow.js";

async function inTempDir(fn) {
  const oldCwd = process.cwd();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "eduorchestrate-"));
  process.chdir(dir);
  try {
    return await fn(dir);
  } finally {
    process.chdir(oldCwd);
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("one-command setup writes universal agent adapters and plan", async () => {
  await inTempDir(async (dir) => {
    await main([
      "--yes",
      "--name",
      "Haroon",
      "--email",
      "haroon@example.com",
      "--role",
      "Agentic AI and LLM Engineer",
      "--skill",
      "RAG evaluation",
      "--stage",
      "beginner",
      "--days",
      "45",
      "--time",
      "07:30",
      "--timezone",
      "Asia/Calcutta"
    ]);

    const expected = [
      "AGENTS.md",
      "GEMINI.md",
      ".claude/skills/eduorchestrate/SKILL.md",
      ".eduorchestrate/adapters/codex/AGENTS.md",
      ".eduorchestrate/adapters/openclaw/SKILL.md",
      ".eduorchestrate/adapters/antigravity/manifest.json",
      ".eduorchestrate/adapters/hermas/manifest.json",
      ".eduorchestrate/adapters/generic/EDUORCHESTRATE.md",
      ".eduorchestrate/mcp/manifest.json",
      ".github/workflows/eduorchestrate-daily.yml",
      "data/30-day-plan.json",
      "data/eduorchestrate-harness.json",
      "data/eduorchestrate-harness.md",
      "data/learning-sources.json",
      "data/learning-sources.md",
      "data/research-index.json",
      "data/default-terminal-card.svg",
      "data/progression-card.md",
      "data/progression-card.json",
      "data/terminal-card.svg"
    ];
    for (const relative of expected) {
      assert.equal(fs.existsSync(path.join(dir, relative)), true, relative);
    }

    const plan = JSON.parse(fs.readFileSync(path.join(dir, "data/30-day-plan.json"), "utf8"));
    const config = JSON.parse(fs.readFileSync(path.join(dir, "eduorchestrate.config.json"), "utf8"));
    const harness = JSON.parse(fs.readFileSync(path.join(dir, "data/eduorchestrate-harness.json"), "utf8"));
    assert.equal(plan.days.length, 45);
    assert.match(config.schedule.startDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(harness.mode, "init");
    assert.equal(harness.tokenPolicy.neverPaste.includes("SVG contents"), true);
    assert.equal(harness.emailPolicy.previewCommand, "npx eduorchestrate send-today --dry-run");
    assert.equal(harness.researchPolicy.maxInlineSources, 5);
    const learningSources = JSON.parse(fs.readFileSync(path.join(dir, "data/learning-sources.json"), "utf8"));
    assert.equal(learningSources.roleKey, "agentic-ai");
    assert.match(JSON.stringify(learningSources), /Anthropic Claude Code docs|IBM SkillsBuild/);
    assert.match(JSON.stringify(learningSources.newsletters), /Anthropic News|Hugging Face Blog/);
    assert.match(plan.days[0].setupOrBuildTask, /Hugging Face|Colab|GitHub/i);
    assert.equal(plan.roleKey, "agentic-ai");
    assert.equal(plan.primarySkill, "RAG evaluation");
    assert.equal(plan.nextSkillRecommendation.afterDay, 45);
    assert.equal(fs.existsSync(path.join(dir, "data/research-index.json")), true);
    const card = fs.readFileSync(path.join(dir, "data/progression-card.md"), "utf8");
    assert.match(card, /^# Agentic AI and LLM Engineer/m);
    assert.match(card, /^## RAG evaluation/m);
    assert.match(card, /GitHub-style learning progression:/);
    assert.match(card, /Terminal card:/);
    assert.match(card, /\$ npx eduorchestrate status/);
    const svg = fs.readFileSync(path.join(dir, "data/terminal-card.svg"), "utf8");
    assert.match(svg, /^<svg /);
    assert.match(svg, /eduorchestrate-terminal/);
    assert.match(svg, /role=&quot;Agentic AI and LLM Engineer&quot;/);
    assert.match(svg, /skill=&quot;RAG evaluation&quot;/);
    const defaultSvg = fs.readFileSync(path.join(dir, "data/default-terminal-card.svg"), "utf8");
    assert.match(defaultSvg, /role=&quot;choose target role&quot;/);
    assert.match(defaultSvg, /skill=&quot;choose first skill&quot;/);

    const adapterInstructionFiles = [
      "AGENTS.md",
      "GEMINI.md",
      ".claude/skills/eduorchestrate/SKILL.md",
      ".eduorchestrate/adapters/codex/AGENTS.md",
      ".eduorchestrate/adapters/openclaw/SKILL.md",
      ".eduorchestrate/adapters/generic/EDUORCHESTRATE.md"
    ];
    for (const relative of adapterInstructionFiles) {
      const content = fs.readFileSync(path.join(dir, relative), "utf8");
      assert.match(content, /resumable browser or workspace instance/, relative);
      assert.match(content, /GitHub Actions remains the scheduled no-browser path/, relative);
    }
    for (const relative of [".eduorchestrate/adapters/antigravity/manifest.json", ".eduorchestrate/adapters/hermas/manifest.json", ".eduorchestrate/mcp/manifest.json"]) {
      const manifest = JSON.parse(fs.readFileSync(path.join(dir, relative), "utf8"));
      if (manifest.instructions) assert.match(manifest.instructions, /resumable browser or workspace instance/, relative);
    }
  });
});

test("agentic ai day one contains required setup surfaces", () => {
  const plan = generate30DayPlan({
    name: "Learner",
    email: "learner@example.com",
    targetRole: "Agentic AI and LLM Engineer",
    focusSkill: "RAG",
    currentLearning: "prompting",
    currentStage: "beginner",
    weeklyHours: 8,
    planDays: 20
  });
  assert.equal(plan.days.length, 30);
  const dayOne = JSON.stringify(plan.days[0]);
  assert.match(dayOne, /Hugging Face/i);
  assert.match(dayOne, /GitHub/i);
  assert.match(dayOne, /Colab/i);
  assert.match(dayOne, /YouTube/i);
  assert.match(dayOne, /timeBox/i);
  assert.match(dayOne, /reviewQuestions/i);
  assert.match(dayOne, /trend-search/i);
  assert.equal(plan.primarySkill, "RAG");
});

test("full-stack role uses full-stack blueprint", () => {
  const plan = generate30DayPlan({
    name: "Learner",
    email: "learner@example.com",
    targetRole: "Full Stack Developer",
    currentStage: "beginner",
    weeklyHours: 8
  });
  assert.equal(plan.roleKey, "full-stack");
  assert.match(plan.capstone, /dashboard/i);
  assert.match(JSON.stringify(plan.days[0]), /Node\.js|GitHub/i);
});

test("daily email dry-run payload contains slash command and references", () => {
  const config = {
    learner: {
      name: "Learner",
    email: "learner@example.com",
    targetRole: "Agentic AI and LLM Engineer",
    currentLearning: "RAG basics",
    focusSkill: "RAG evaluation"
    }
  };
  const plan = generate30DayPlan(config.learner);
  const email = renderDailyEmail(config, plan, 1);
  assert.equal(email.to, "learner@example.com");
  assert.match(email.text, /\/eduorchestrate/);
  assert.match(email.text, /youtube\.com/);
  assert.match(email.text, /github\.com/);
  assert.match(email.text, /Timebox:/);
  assert.match(email.text, /Review questions:/);
  assert.match(email.text, /Current learning: RAG basics/);
  assert.match(email.text, /Primary skill focus:/);
});

test("cron is generated from requested time", () => {
  assert.equal(cronFromTime("07:30"), "30 7 * * *");
  assert.equal(cronFromTime("bad"), "0 8 * * *");
});

test("scheduled send resolves the plan day from the configured start date", () => {
  const plan = generate30DayPlan({
    name: "Learner",
    email: "learner@example.com",
    targetRole: "Agentic AI and LLM Engineer",
    focusSkill: "RAG",
    planDays: 30
  });
  const config = {
    schedule: {
      startDate: "2026-06-10",
      timezone: "UTC"
    }
  };

  assert.equal(resolveScheduledDay(config, plan, new Date("2026-06-10T12:00:00Z")), 1);
  assert.equal(resolveScheduledDay(config, plan, new Date("2026-06-12T12:00:00Z")), 3);
});

test("scheduled send handles missing or invalid start dates safely", () => {
  const plan = generate30DayPlan({
    name: "Learner",
    email: "learner@example.com",
    targetRole: "Data Scientist",
    planDays: 30
  });

  assert.equal(resolveScheduledDay({}, plan, new Date("2026-06-12T12:00:00Z")), 1);
  assert.equal(resolveScheduledDay({ schedule: { startDate: "bad-date", timezone: "UTC" } }, plan, new Date("2026-06-12T12:00:00Z")), 1);
  assert.equal(resolveScheduledDay({ schedule: { startDate: "2026-02-31", timezone: "UTC" } }, plan, new Date("2026-06-12T12:00:00Z")), 1);
});

test("scheduled send skips after the plan window instead of sending forever", async () => {
  await inTempDir(async (dir) => {
    await main(["--yes", "--name", "Learner", "--email", "learner@example.com", "--role", "Data Scientist", "--days", "30"]);
    const configPath = path.join(dir, "eduorchestrate.config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    config.schedule.startDate = "2020-01-01";
    fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");

    await main(["send-today"]);

    const latest = JSON.parse(fs.readFileSync(path.join(dir, "data/latest-email.json"), "utf8"));
    assert.equal(latest.skipped, true);
    assert.equal(latest.reason, "plan-complete");
    assert.equal(latest.planDays, 30);
  });
});

test("explicit send-today day overrides plan-complete scheduled skip", async () => {
  await inTempDir(async (dir) => {
    await main(["--yes", "--name", "Learner", "--email", "learner@example.com", "--role", "Data Scientist", "--days", "30"]);
    const configPath = path.join(dir, "eduorchestrate.config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    config.schedule.startDate = "2020-01-01";
    fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");

    await main(["send-today", "--dry-run", "--day", "1"]);

    const latest = JSON.parse(fs.readFileSync(path.join(dir, "data/latest-email.json"), "utf8"));
    assert.equal(latest.dryRun, true);
    assert.equal(latest.skipped, undefined);
    assert.match(latest.message.subject, /Day 1:/);
  });
});

test("commands recover when the saved plan has no days", async () => {
  await inTempDir(async (dir) => {
    await main(["--yes", "--name", "Learner", "--email", "learner@example.com", "--role", "Data Scientist", "--days", "30"]);
    const planPath = path.join(dir, "data/30-day-plan.json");
    fs.writeFileSync(planPath, `${JSON.stringify({ days: [] }, null, 2)}\n`, "utf8");

    await main(["status"]);

    const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
    assert.equal(plan.days.length, 30);
    assert.equal(plan.roleKey, "data-science");
  });
});

test("expanded CLI commands create research, progress, status, and weekly summary", async () => {
  await inTempDir(async (dir) => {
    await main([
      "--yes",
      "--name",
      "Haroon",
      "--email",
      "haroon@example.com",
      "--role",
      "Cybersecurity Analyst",
      "--current-learning",
      "networking basics",
      "--focus-skill",
      "SIEM",
      "--stage",
      "beginner"
    ]);
    await main(["research", "--day", "1"]);
    await main(["harness", "--mode", "research"]);
    await main(["courses"]);
    await main(["log-progress", "--day", "1", "--completed", "Built lab notes repo", "--evidence", "GitHub commit", "--confidence", "4"]);
    await main(["status"]);
    await main(["weekly-summary", "--week", "1"]);
    await main(["recommend-next"]);
    await main(["progress-card"]);
    await main(["terminal-card"]);
    await main(["setup-secrets"]);
    await main(["doctor"]);

    assert.equal(fs.existsSync(path.join(dir, "data/progress-log.json")), true);
    assert.equal(fs.existsSync(path.join(dir, "data/latest-review.json")), true);
    assert.equal(fs.existsSync(path.join(dir, "data/weekly-summary-1.json")), true);
    assert.equal(fs.existsSync(path.join(dir, "data/next-skill-recommendation.json")), true);
    assert.equal(fs.existsSync(path.join(dir, "data/eduorchestrate-harness.md")), true);
    assert.equal(fs.existsSync(path.join(dir, "data/learning-sources.md")), true);
    assert.equal(fs.existsSync(path.join(dir, "data/progression-card.md")), true);
    assert.equal(fs.existsSync(path.join(dir, "data/terminal-card.svg")), true);
    const plan = JSON.parse(fs.readFileSync(path.join(dir, "data/30-day-plan.json"), "utf8"));
    assert.equal(plan.roleKey, "cybersecurity");
    assert.equal(plan.primarySkill, "SIEM");
    const progress = JSON.parse(fs.readFileSync(path.join(dir, "data/progress-log.json"), "utf8"));
    assert.equal(progress[0].completed, "Built lab notes repo");
    const card = fs.readFileSync(path.join(dir, "data/progression-card.md"), "utf8");
    assert.match(card, /^# Cybersecurity Analyst/m);
    assert.match(card, /^## SIEM/m);
    assert.match(card, /# > \./);
    const svg = fs.readFileSync(path.join(dir, "data/terminal-card.svg"), "utf8");
    assert.match(svg, /latest_evidence=&quot;GitHub commit&quot;/);
    const harness = JSON.parse(fs.readFileSync(path.join(dir, "data/eduorchestrate-harness.json"), "utf8"));
    assert.equal(harness.mode, "research");
    assert.match(harness.cardPolicy.rule, /Never create/);
    const harnessMarkdown = fs.readFileSync(path.join(dir, "data/eduorchestrate-harness.md"), "utf8");
    assert.match(harnessMarkdown, /Email rule:/);
    assert.match(harnessMarkdown, /daily-mail checkpoint/);
    const learningSources = JSON.parse(fs.readFileSync(path.join(dir, "data/learning-sources.json"), "utf8"));
    assert.equal(learningSources.roleKey, "cybersecurity");
    assert.match(JSON.stringify(learningSources.recommendedSources), /Cisco Networking Academy|IBM SkillsBuild/);
    assert.match(JSON.stringify(learningSources.newsletters), /CISA Cybersecurity Advisories/);
  });
});

test("plan command honors requested days above the 30 day minimum", async () => {
  await inTempDir(async (dir) => {
    await main(["--yes", "--name", "Learner", "--email", "learner@example.com", "--role", "Data Scientist", "--skill", "SQL", "--days", "60"]);
    await main(["plan", "--days", "45", "--skill", "model evaluation"]);
    const plan = JSON.parse(fs.readFileSync(path.join(dir, "data/30-day-plan.json"), "utf8"));
    assert.equal(plan.days.length, 45);
    assert.equal(plan.primarySkill, "model evaluation");
    assert.equal(plan.nextSkillRecommendation.afterDay, 45);
  });
});
