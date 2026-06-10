import fs from "node:fs";
import path from "node:path";
import { ensureDir } from "./config.js";

export function cronFromTime(time, timezone = "UTC") {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time || "08:00");
  if (!match) return "0 8 * * *";
  const hour = Math.min(23, Math.max(0, Number.parseInt(match[1], 10)));
  const minute = Math.min(59, Math.max(0, Number.parseInt(match[2], 10)));
  if (!timezone || timezone.toUpperCase() === "UTC") return `${minute} ${hour} * * *`;
  const utc = localTimeToUtc(hour, minute, timezone);
  return `${utc.minute} ${utc.hour} * * *`;
}

export function writeGithubWorkflow(config, rootDir = process.cwd()) {
  const workflowPath = path.join(rootDir, ".github/workflows/eduorchestrate-daily.yml");
  ensureDir(path.dirname(workflowPath));
  fs.writeFileSync(workflowPath, workflowContent(config), "utf8");
  return workflowPath;
}

export function workflowContent(config) {
  const cron = cronFromTime(config.schedule?.dailyEmailTime, config.schedule?.timezone);
  return `name: EduOrchestrate Daily Plan\n\non:\n  schedule:\n    # GitHub Actions cron is UTC. Generated from ${config.schedule?.dailyEmailTime || "08:00"} ${config.schedule?.timezone || "UTC"}.\n    - cron: "${cron}"\n  workflow_dispatch:\n\njobs:\n  send-daily-plan:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: "20"\n      - run: npm install --no-package-lock\n      - name: Send today's EduOrchestrate email\n        env:\n          SMTP_HOST: \${{ secrets.SMTP_HOST }}\n          SMTP_PORT: \${{ secrets.SMTP_PORT }}\n          SMTP_USER: \${{ secrets.SMTP_USER }}\n          SMTP_PASS: \${{ secrets.SMTP_PASS }}\n          SMTP_FROM: \${{ secrets.SMTP_FROM }}\n        run: node bin/eduorchestrate.js send-today\n`;
}

function localTimeToUtc(hour, minute, timezone) {
  try {
    const now = new Date();
    const candidate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, minute));
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });
    const parts = Object.fromEntries(formatter.formatToParts(candidate).map((part) => [part.type, part.value]));
    const seenMinutes = Number.parseInt(parts.hour, 10) * 60 + Number.parseInt(parts.minute, 10);
    const desiredMinutes = hour * 60 + minute;
    const corrected = new Date(candidate.getTime() + (desiredMinutes - seenMinutes) * 60 * 1000);
    return { hour: corrected.getUTCHours(), minute: corrected.getUTCMinutes() };
  } catch {
    return { hour, minute };
  }
}
