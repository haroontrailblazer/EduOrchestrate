<div align="center">

# EduOrchestrate

Universal `/eduorchestrate` agent skill and daily learning orchestrator.

![Image 2026-01-16 at 12 55 32 PM](https://github.com/user-attachments/assets/75c88ec1-dd8a-43c3-a9d3-78894ad1d6f5)

</div>

EduOrchestrate is a vendor-neutral learning coach for job-role learners. A single NPX command installs agent adapters, asks for the learner profile, generates a first 30-day plan, prepares daily email delivery, and creates a GitHub Actions runner for autonomous daily plans.

## One Command

From an agent terminal in the cloned repo:

```bash
npx eduorchestrate
```

For local development before publishing the package:

```bash
npx .
```

The setup asks for name, email, target/searching role, current stage, daily email time, timezone, and SMTP settings.

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
npx eduorchestrate send-today --dry-run
npx eduorchestrate send-today
```

For an Agentic AI / LLM role, day 1 starts with Hugging Face, GitHub, and Google Colab setup, then points the learner toward docs, YouTube search links, and GitHub sample-code search links.

State is written to `data/` by default and is ignored by git. SMTP secrets are written to `.env.local` or GitHub Actions secrets, never to committed config.

## Architecture

- `src/`: dependency-free Node CLI, planner, adapter generator, workflow generator, and SMTP mailer.
- `skills/eduorchestrate/`: canonical universal EduOrchestrate skill.
- `tests/node/`: Node regression tests.

## Validate

```bash
npm test
```
