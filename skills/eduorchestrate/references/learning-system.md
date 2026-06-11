# EduOrchestrate Learning System

## Operating Loop

Run the learner through this loop:

1. Define the role outcome.
2. Identify the smallest useful skill gap.
3. Choose current sources when freshness matters.
4. Build a small artifact.
5. Log evidence.
6. Review and adjust the next day.

The system is not a motivational chatbot. It is a training orchestrator that protects learner focus and converts learning into job-role evidence.

## Harness Policy

Use `npx eduorchestrate harness` as the first command for agent runs after initialization.

The harness keeps the skill token-conscious by:

- loading `data/eduorchestrate-harness.json` before broader docs
- loading only the active plan day unless the user asks for a full review
- calling CLI programs for research, mail, progress, and cards instead of recreating their outputs
- keeping source digests as artifacts and summarizing only the useful entries
- previewing email with `send-today --dry-run` before sending unless the user explicitly asks to send
- never exposing SMTP secrets or pasting SVG/card source into chat

## 30-Day Plan Policy

A good plan has:

- role-specific skills instead of generic study topics
- one visible artifact or proof item per day
- current-technology references where useful
- trend-scanning entry points for current tools, models, frameworks, and practices
- review points based on evidence, not time spent
- daily email text that can be acted on immediately
- progress logging and weekly summaries
- source digests that distinguish official sources from search entry points
- a prebuilt skill progression card loaded from the skill package or CLI artifact

Avoid course-list plans. Courses can be sources, but the plan should be organized around capability and proof.

The learner may choose any plan length, but the minimum is always 30 days. If the learner asks for fewer days, generate 30 days. If they ask for more, extend the plan with next-skill ramp and trend-refresh days.

## Practical Build Guide Policy

Every daily guide should include:

- problem statement or role context
- smallest useful action
- setup/build task
- source links to research
- evidence checklist
- next-day bridge

For technical roles, evidence should normally include code, tests, logs, screenshots, demo notes, benchmark output, or a written design decision.

## Progress Policy

Progress entries should capture:

- day number
- what was completed
- evidence link or notes
- time spent
- confidence score
- blocker, if any

Use confidence and blockers to decide whether to advance, repeat, or narrow the next task.

## Skill Progression Card Policy

The card UI is a prebuilt program and bundled asset, not an agent-authored response. Never type, recreate, or hand-design the card in prompts.

On initialization, copy the bundled default card from `skills/eduorchestrate/assets/default-terminal-card.svg` to `data/default-terminal-card.svg`.

When learner-specific state is needed, call the prebuilt CLI program to write `data/progression-card.md`, `data/progression-card.json`, and `data/terminal-card.svg`.

The card must include:

- target role as the main heading
- selected skill as the second heading
- current learning topic
- completed days and total plan days
- GitHub-commit-style grid where `#` is complete, `>` is active, and `.` is upcoming
- terminal card with `npx eduorchestrate status`, role, skill, progress, current day, next action, latest evidence, and momentum
- SVG terminal-card replica in `data/terminal-card.svg`

Keep the card text portable so any agent can load it into email, chat, Markdown previews, or issue comments.

Agents should load `data/default-terminal-card.svg`, `data/terminal-card.svg`, or call `npx eduorchestrate progress-card` / `npx eduorchestrate terminal-card`. The repo owns the compact component renderer.

## Freshness Policy

Use current research for:

- rapidly changing tools, APIs, frameworks, models, and security threats
- job-market expectations for a target role
- project implementation choices that depend on recent releases
- deciding whether the next skill recommendation should change after the current plan

Do not browse for stable fundamentals unless the learner asks for sources.
