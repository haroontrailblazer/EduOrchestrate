import path from "node:path";
import { readJson, resolveDataDir, writeJson } from "./config.js";

export function appendProgress(config, entry) {
  const dataDir = resolveDataDir(config);
  const logPath = path.join(dataDir, "progress-log.json");
  const existing = readJson(logPath, []);
  const normalized = {
    loggedAt: new Date().toISOString(),
    day: Number.parseInt(entry.day, 10) || inferNextDay(existing),
    completed: entry.completed || "No completion note provided.",
    evidence: entry.evidence || "No evidence provided.",
    minutes: Number.parseInt(entry.minutes, 10) || 0,
    confidence: Number.parseInt(entry.confidence, 10) || 3,
    blocker: entry.blocker || ""
  };
  existing.push(normalized);
  writeJson(logPath, existing);
  return normalized;
}

export function reviewProgress(config, plan) {
  const entries = readJson(path.join(resolveDataDir(config), "progress-log.json"), []);
  const completedDays = new Set(entries.map((entry) => entry.day));
  const latest = entries.at(-1) || null;
  const totalDays = plan.days.length || 30;
  const nextDay = Math.min(totalDays, Math.max(1, (latest?.day || 0) + 1));
  const activeDay = plan.days.find((day) => day.day === nextDay) || plan.days.at(-1);
  const blockers = entries.filter((entry) => entry.blocker).map((entry) => entry.blocker);
  return {
    generatedAt: new Date().toISOString(),
    completedEntries: entries.length,
    completedDays: completedDays.size,
    latestEvidence: latest?.evidence || "",
    activeDay: activeDay?.day || 1,
    nextAction: activeDay ? activeDay.setupOrBuildTask : "Regenerate the plan and continue with one artifact.",
    nextSkillRecommendation: completedDays.size >= totalDays ? plan.nextSkillRecommendation : null,
    risk: blockers.length ? `Resolve blocker: ${blockers.at(-1)}` : "No active blocker logged.",
    momentum: momentum(entries)
  };
}

export function createWeeklySummary(config, plan, week = 1) {
  const entries = readJson(path.join(resolveDataDir(config), "progress-log.json"), []);
  const start = (week - 1) * 7 + 1;
  const end = Math.min(plan.days.length || 30, start + 6);
  const weekEntries = entries.filter((entry) => entry.day >= start && entry.day <= end);
  const plannedDays = plan.days.filter((day) => day.day >= start && day.day <= end);
  return {
    generatedAt: new Date().toISOString(),
    week,
    range: `${start}-${end}`,
    planned: plannedDays.map((day) => ({ day: day.day, title: day.title })),
    completed: weekEntries.map((entry) => ({ day: entry.day, completed: entry.completed, evidence: entry.evidence })),
    summary: weekEntries.length
      ? `Completed ${weekEntries.length}/${plannedDays.length} logged days. Keep the next week focused on visible artifacts.`
      : "No progress logged for this week. Restart with the first unfinished day and produce one proof artifact.",
    nextWeekFocus: plan.days.find((day) => day.day === end + 1)?.title || plan.nextSkillRecommendation?.recommendedNextSkill || "Review and portfolio polish"
  };
}

export function planStatus(config, plan) {
  const review = reviewProgress(config, plan);
  return {
    learner: config.learner.name,
    targetRole: config.learner.targetRole,
    emailTime: `${config.schedule.dailyEmailTime} ${config.schedule.timezone}`,
    daysPlanned: plan.days.length,
    primarySkill: plan.primarySkill,
    currentLearning: config.learner.currentLearning,
    ...review
  };
}

function inferNextDay(entries) {
  return Math.max(1, (entries.at(-1)?.day || 0) + 1);
}

function momentum(entries) {
  const recent = entries.slice(-3);
  if (!recent.length) return "not-started";
  const avgConfidence = recent.reduce((sum, entry) => sum + entry.confidence, 0) / recent.length;
  if (recent.some((entry) => entry.blocker)) return "blocked";
  if (avgConfidence >= 4) return "strong";
  if (avgConfidence >= 3) return "steady";
  return "needs-support";
}
