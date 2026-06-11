import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export async function collectOnboarding({ defaults = {}, nonInteractive = false, overrides = {} } = {}) {
  const fallback = {
    name: "Learner",
    email: "learner@example.com",
    targetRole: "Agentic AI and LLM Engineer",
    currentLearning: "not started yet",
    focusSkill: "RAG and agent workflows",
    currentStage: "beginner",
    weeklyHours: "8",
    planDays: "30",
    dailyEmailTime: "08:00",
    timezone: "UTC",
    smtpHost: "smtp.gmail.com",
    smtpPort: "465",
    smtpUser: "",
    smtpPass: "",
    smtpFrom: ""
  };
  const values = { ...fallback, ...defaults, ...overrides };
  if (nonInteractive) return normalizeAnswers(values);

  const rl = readline.createInterface({ input, output });
  try {
    const ask = async (key, label) => {
      const answer = await rl.question(`${label} [${values[key]}]: `);
      values[key] = answer.trim() || values[key];
    };
    await ask("name", "Your name");
    await ask("email", "Email for daily plans");
    await ask("targetRole", "Target/searching role");
    await ask("currentLearning", "What are you learning right now in this role");
    await ask("focusSkill", "First skill you want to focus on");
    await ask("currentStage", "Current stage");
    await ask("weeklyHours", "Weekly learning hours");
    await ask("planDays", "Plan length in days, minimum fixed at 30");
    await ask("dailyEmailTime", "Daily email time, 24h HH:MM");
    await ask("timezone", "Timezone");
    await ask("smtpHost", "SMTP host");
    await ask("smtpPort", "SMTP port");
    await ask("smtpUser", "SMTP username");
    await ask("smtpPass", "SMTP password or app password");
    await ask("smtpFrom", "From email");
    return normalizeAnswers(values);
  } finally {
    rl.close();
  }
}

export function normalizeAnswers(values) {
  return {
    learner: {
      name: values.name,
      email: values.email,
      targetRole: values.targetRole,
      currentLearning: values.currentLearning,
      focusSkill: values.focusSkill,
      currentStage: values.currentStage,
      weeklyHours: Number.parseInt(values.weeklyHours, 10) || 8,
      planDays: Math.max(30, Number.parseInt(values.planDays, 10) || 30)
    },
    schedule: {
      dailyEmailTime: values.dailyEmailTime,
      timezone: values.timezone
    },
    smtp: {
      host: values.smtpHost,
      port: Number.parseInt(values.smtpPort, 10) || 465,
      user: values.smtpUser,
      pass: values.smtpPass,
      from: values.smtpFrom || values.smtpUser || values.email
    }
  };
}
