---
name: eduorchestrate
description: Universal /eduorchestrate agent skill for job-role learners. Use when an agent needs to expose or honor /eduorchestrate, onboard a learner, ask what they are currently learning, ask which first skill they want to focus on, create an adaptive role plan with a fixed 30-day minimum, research trending technology updates with sources, send daily learning emails, recommend the next skill after the plan window, create practical build guides, track progress, load the prebuilt skill progression card, generate weekly summaries, diagnose setup, configure email secrets, and keep the learner focused on the next useful action.
---

# EduOrchestrate

Visible command: `/eduorchestrate`.

If the host agent cannot register slash commands, treat `eduorchestrate` or `use EduOrchestrate` as equivalent to `/eduorchestrate`.

## Core Workflow

Use EduOrchestrate to guide a learner from a target job role to focused daily execution:

1. Capture the learner profile: name, email, target role, current learning topic, first skill focus, current stage, weekly hours, requested plan length, daily email time, and timezone.
2. Generate the first plan with a 30-day minimum, even if the learner requests fewer days.
3. Load the compact harness before research, mail, progress, or review work.
4. Research current and trending updates only when they affect the learner's roadmap or build work.
5. Convert each day into a practical build action with visible proof.
6. Send or preview the daily plan email.
7. Load the prebuilt skill learning card; never recreate or type card UI in the agent response.
8. Review progress evidence and recommend one next action.
9. After the plan window, recommend the next skill to learn.

Prefer practical output over long curriculum text. Keep the active plan narrow: one core topic, one build artifact, and one review loop per day.

## NPX CLI

Use the NPX CLI:

```bash
npx eduorchestrate
npx eduorchestrate /eduorchestrate
npx eduorchestrate plan --role "Agentic AI and LLM Engineer"
npx eduorchestrate plan --role "Agentic AI and LLM Engineer" --skill "RAG evaluation" --days 45
npx eduorchestrate harness
npx eduorchestrate status
npx eduorchestrate research --day 1
npx eduorchestrate send-today --dry-run
npx eduorchestrate log-progress --day 1 --completed "Built setup" --evidence "Repo link"
npx eduorchestrate weekly-summary --week 1
npx eduorchestrate progress-card
npx eduorchestrate terminal-card
npx eduorchestrate recommend-next
npx eduorchestrate setup-secrets
npx eduorchestrate doctor
```

The CLI stores local state in `data/` by default:

- `30-day-plan.json`
- `eduorchestrate-harness.json`
- `eduorchestrate-harness.md`
- `research-digests/*.json`
- `progress-log.json`
- `default-terminal-card.svg`
- `progression-card.md`
- `progression-card.json`
- `terminal-card.svg`
- `weekly-summary-*.json`
- generated email previews and runtime outputs

Plan length can be greater than 30 days. If the learner asks for less than 30 days, still generate 30 days.

## Specialist Agents

Treat the system as a typed multi-agent workflow, even when a single model is executing it:

- `GoalMapper`: translate target role and current stage into priority skills.
- `CurriculumPlanner`: create milestones and a daily focus plan.
- `Researcher`: gather dated, sourced updates from official docs, release notes, or reputable technical sources.
- `BuildMentor`: turn topics into practical projects with deliverables.
- `FocusCoach`: limit scope and prevent resource overload.
- `Evaluator`: review learner evidence and adjust the next action.

For exact contracts, read `references/agent-contracts.md`. For learning-loop policy and roadmap behavior, read `references/learning-system.md`.

## Universal Agent Adapters

The setup command writes adapter files so common agents can honor `/eduorchestrate`:

- Claude Code: `.claude/skills/eduorchestrate/SKILL.md`
- Codex and generic coding agents: `AGENTS.md`
- Gemini: `GEMINI.md`
- OpenClaw: `.eduorchestrate/adapters/openclaw/SKILL.md`
- Antigravity: `.eduorchestrate/adapters/antigravity/manifest.json`
- Hermas: `.eduorchestrate/adapters/hermas/manifest.json`
- MCP-capable agents: `.eduorchestrate/mcp/manifest.json`

## Role Blueprints

Use built-in blueprints for:

- Agentic AI and LLM Engineer
- Full-Stack Developer
- Cybersecurity Analyst
- Data Scientist

For other roles, infer the closest blueprint and keep the plan artifact-driven.

## Research Rules

When the learner asks for current technology edge, browse or otherwise verify current sources if the runtime supports it. Every update must include:

- source title
- source URL
- access or publication date
- why it matters to the target role
- one concrete practice task

Do not change the roadmap because a technology is trendy. Change it only when the update improves employability, project quality, interview readiness, or safety.
