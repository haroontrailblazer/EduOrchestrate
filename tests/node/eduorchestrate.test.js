import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { main } from "../../src/cli.js";
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
      "--stage",
      "beginner",
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
      "data/30-day-plan.json"
    ];
    for (const relative of expected) {
      assert.equal(fs.existsSync(path.join(dir, relative)), true, relative);
    }

    const plan = JSON.parse(fs.readFileSync(path.join(dir, "data/30-day-plan.json"), "utf8"));
    assert.equal(plan.days.length, 30);
    assert.match(plan.days[0].setupOrBuildTask, /Hugging Face|Colab|GitHub/i);
  });
});

test("agentic ai day one contains required setup surfaces", () => {
  const plan = generate30DayPlan({
    name: "Learner",
    email: "learner@example.com",
    targetRole: "Agentic AI and LLM Engineer",
    currentStage: "beginner",
    weeklyHours: 8
  });
  const dayOne = JSON.stringify(plan.days[0]);
  assert.match(dayOne, /Hugging Face/i);
  assert.match(dayOne, /GitHub/i);
  assert.match(dayOne, /Colab/i);
  assert.match(dayOne, /YouTube/i);
});

test("daily email dry-run payload contains slash command and references", () => {
  const config = {
    learner: {
      name: "Learner",
      email: "learner@example.com",
      targetRole: "Agentic AI and LLM Engineer"
    }
  };
  const plan = generate30DayPlan(config.learner);
  const email = renderDailyEmail(config, plan, 1);
  assert.equal(email.to, "learner@example.com");
  assert.match(email.text, /\/eduorchestrate/);
  assert.match(email.text, /youtube\.com/);
  assert.match(email.text, /github\.com/);
});

test("cron is generated from requested time", () => {
  assert.equal(cronFromTime("07:30"), "30 7 * * *");
  assert.equal(cronFromTime("bad"), "0 8 * * *");
});
