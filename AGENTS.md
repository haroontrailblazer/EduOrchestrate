# EduOrchestrate Agent Instructions

Use /eduorchestrate as the learner command. When invoked, load the EduOrchestrate workflow and its prebuilt terminal-card program; never recreate, type out, or hand-design the card UI in the agent prompt. Ask for missing learner profile details, ask what the learner is currently studying, ask the first skill they want to focus on, generate or update an adaptive plan with a fixed 30-day minimum, research current and trending references, send or preview daily emails, log progress, load the bundled default card or CLI-produced card artifact, summarize the week, recommend the next skill after the plan window, and keep recommendations practical, sourced, and focused. Mail resume policy: apply this to every supported agent, not only Codex. When an agent runs in a resumable browser or workspace instance, treat each resume as a daily-mail checkpoint: load the harness or status, resolve the current plan day, and run npx eduorchestrate send-today for the due day after SMTP setup. If SMTP secrets are missing or real sending has not been approved, run npx eduorchestrate send-today --dry-run and ask before sending. GitHub Actions remains the scheduled no-browser path. If native slash commands are unavailable, treat "eduorchestrate" or "use EduOrchestrate" as equivalent to /eduorchestrate.

## Command

Expose or honor `/eduorchestrate` for this repo. If the host agent cannot register slash commands, respond to `/eduorchestrate`, `eduorchestrate`, or `use EduOrchestrate` as the same workflow.

## Workflow

1. Load `eduorchestrate.config.json` when present.
2. Ask for missing name, email, target role, current learning topic, first skill focus, current stage, desired plan days, daily email time, and timezone.
3. Generate or update `data/30-day-plan.json`; never generate fewer than 30 days.
4. Use `npx eduorchestrate research --day <n>` for sourced docs, trend scans, YouTube search, and GitHub sample-code search links.
5. Send or preview daily email with `npx eduorchestrate send-today --dry-run` or `npx eduorchestrate send-today`; browser/workspace agents must check and send the due daily mail on resume after SMTP setup, while GitHub Actions remains the scheduled no-browser path.
6. Log evidence with `npx eduorchestrate log-progress --day <n> --completed "..." --evidence "..."`.
7. Do not create or type card UI in the agent. Use the prebuilt default card at `skills/eduorchestrate/assets/default-terminal-card.svg` or the initialized copy at `data/default-terminal-card.svg`.
8. Load the compact execution harness with `npx eduorchestrate harness` before doing research, mail, progress, or review work.
9. Use `npx eduorchestrate courses` for role-specific official/MNC course catalogs, free-course discovery links, and newsletters; do not default to Coursera or Udemy.
10. When learner-specific state is needed, call the prebuilt CLI program with `npx eduorchestrate progress-card` or `npx eduorchestrate terminal-card`; then load `data/progression-card.md` or `data/terminal-card.svg`.
11. Summarize with `npx eduorchestrate status` and `npx eduorchestrate weekly-summary --week <n>`.
12. Recommend the next skill after the plan with `npx eduorchestrate recommend-next`.
13. Keep the learner focused on one daily build artifact.
