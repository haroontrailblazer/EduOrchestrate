---
name: eduorchestrate
description: Use /eduorchestrate to onboard a learner, create an adaptive job-role plan with a 30-day minimum, research trends, send daily plan emails, log progress, load the prebuilt skill progression card, summarize weeks, recommend the next skill, and review progress.
---

# EduOrchestrate

Use /eduorchestrate as the learner command. When invoked, load the EduOrchestrate workflow and its prebuilt terminal-card program; never recreate, type out, or hand-design the card UI in the agent prompt. Ask for missing learner profile details, ask what the learner is currently studying, ask the first skill they want to focus on, generate or update an adaptive plan with a fixed 30-day minimum, research current and trending references, send or preview daily emails, log progress, load the bundled default card or CLI-produced card artifact, summarize the week, recommend the next skill after the plan window, and keep recommendations practical, sourced, and focused. Mail resume policy: apply this to every supported agent, not only Codex. When an agent runs in a resumable browser or workspace instance, treat each resume as a daily-mail checkpoint: load the harness or status, resolve the current plan day, and run npx eduorchestrate send-today for the due day after SMTP setup. If SMTP secrets are missing or real sending has not been approved, run npx eduorchestrate send-today --dry-run and ask before sending. GitHub Actions remains the scheduled no-browser path. If native slash commands are unavailable, treat "eduorchestrate" or "use EduOrchestrate" as equivalent to /eduorchestrate.

Run local commands when needed:

```bash
npx eduorchestrate
npx eduorchestrate harness
npx eduorchestrate courses
npx eduorchestrate status
npx eduorchestrate research --day 1
npx eduorchestrate send-today --dry-run
npx eduorchestrate log-progress --day 1 --completed "Built setup" --evidence "Repo link"
npx eduorchestrate weekly-summary --week 1
npx eduorchestrate progress-card
npx eduorchestrate terminal-card
npx eduorchestrate recommend-next
```
