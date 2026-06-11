<div align="center">

# EduOrchestrate

Universal `/eduorchestrate` agent skill and daily learning orchestrator.

![Image 2026-01-16 at 12 55 32 PM](https://github.com/user-attachments/assets/75c88ec1-dd8a-43c3-a9d3-78894ad1d6f5)

</div>

EduOrchestrate is a vendor-neutral learning coach for job-role learners. A single NPX command installs agent adapters, asks for the learner profile, generates a first 30-day plan, prepares daily email delivery, and creates a GitHub Actions runner for autonomous daily plans.

It includes role blueprints for Agentic AI/LLM, full-stack development, cybersecurity, and data science, plus first-skill focus selection, learner-chosen plan length with a fixed 30-day minimum, a token-conscious execution harness, trend-aware research digests, progress logging, prebuilt GitHub-style skill progression cards, weekly summaries, setup diagnostics, and GitHub Actions secret setup guidance.

## One Command

From an agent terminal in the cloned repo:

```bash
npx eduorchestrate
```

For local development before publishing the package:

```bash
npx .
```

The setup asks for name, email, target/searching role, what the learner is currently studying, the first skill they want to focus on, current stage, plan length in days, daily email time, timezone, and SMTP settings.

## Agent Integrations

EduOrchestrate exposes or teaches `/eduorchestrate` through:

- Claude Code: `.claude/skills/eduorchestrate/SKILL.md`
- Codex and generic coding agents: `AGENTS.md`
- Gemini: `GEMINI.md`
- OpenClaw: `.eduorchestrate/adapters/openclaw/SKILL.md`
- Antigravity: `.eduorchestrate/adapters/antigravity/manifest.json`
- Hermas: `.eduorchestrate/adapters/hermas/manifest.json`
- MCP-capable agents: `.eduorchestrate/mcp/manifest.json`

Where a runtime does not support native slash command registration, it should treat `eduorchestrate` or `use EduOrchestrate` as equivalent to `/eduorchestrate`.

## Daily Learning Flow

```bash
npx eduorchestrate plan --role "Agentic AI and LLM Engineer"
npx eduorchestrate plan --role "Agentic AI and LLM Engineer" --skill "RAG evaluation" --days 45
npx eduorchestrate harness
npx eduorchestrate status
npx eduorchestrate research --day 1
npx eduorchestrate send-today --dry-run
npx eduorchestrate send-today
npx eduorchestrate log-progress --day 1 --completed "Built setup" --evidence "Repo link"
npx eduorchestrate weekly-summary --week 1
npx eduorchestrate progress-card
npx eduorchestrate terminal-card
npx eduorchestrate recommend-next
```

For an Agentic AI / LLM role, day 1 starts with Hugging Face, GitHub, and Google Colab setup, then points the learner toward docs, YouTube search links, and GitHub sample-code search links.

Every day includes a trend scan entry point so agents can adapt the plan when current tools, models, frameworks, or best practices change. `harness` writes `data/eduorchestrate-harness.json` and `.md`, telling agents what to load first, when to research, how to preview/send mail, and what not to paste into chat. Agents never create or type the card UI. The skill ships `skills/eduorchestrate/assets/default-terminal-card.svg`; initialization copies it to `data/default-terminal-card.svg`. `progress-card` and `terminal-card` run the prebuilt CLI program to write learner-specific `data/progression-card.md`, `data/progression-card.json`, and `data/terminal-card.svg`. After the plan window is complete, `recommend-next` suggests the next skill to learn based on the current role and first-skill focus.

State is written to `data/` by default and is ignored by git. SMTP secrets are written to `.env.local` or GitHub Actions secrets, never to committed config.

## Setup Helpers

```bash
npx eduorchestrate setup-secrets
npx eduorchestrate doctor
```

`setup-secrets` prints the `gh secret set` commands needed for GitHub Actions email delivery. `doctor` verifies the repo has the expected skill, adapter, config, and environment files.

## Architecture

- `src/`: dependency-free Node CLI, planner, adapter generator, workflow generator, and SMTP mailer.
- `src/harness.js`: compact execution harness for token-conscious agent runs.
- `src/research.js`: source digest generation for official docs, YouTube search, and GitHub sample-code search.
- `src/progress.js`: progress log, status, and weekly summary logic.
- `src/card-components.js`: compact React-style SVG component renderer for terminal cards.
- `src/progression-card.js`: role/skill progression card and terminal card generation.
- `skills/eduorchestrate/assets/default-terminal-card.svg`: bundled default card loaded by the skill.
- `skills/eduorchestrate/`: canonical universal EduOrchestrate skill.
- `tests/node/`: Node regression tests.

## Validate

```bash
npm test
```
