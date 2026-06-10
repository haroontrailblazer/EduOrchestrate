---
name: eduorchestrate
description: Universal /eduorchestrate agent skill for job-role learners. Use when an agent needs to expose or honor /eduorchestrate, onboard a learner, create a first 30-day role plan, research current technology updates with sources, send daily learning emails, create practical build guides, track progress, and keep the learner focused on the next useful action.
---

# EduOrchestrate

Visible command: `/eduorchestrate`.

If the host agent cannot register slash commands, treat `eduorchestrate` or `use EduOrchestrate` as equivalent to `/eduorchestrate`.

## Core Workflow

Use EduOrchestrate to guide a learner from a target job role to focused daily execution:

1. Capture the learner profile: name, email, target role, current stage, weekly hours, daily email time, and timezone.
2. Generate the first 30-day plan.
3. Research current updates only when they affect the learner's roadmap or build work.
4. Convert each day into a practical build action with visible proof.
5. Send or preview the daily plan email.
6. Review progress evidence and recommend one next action.

Prefer practical output over long curriculum text. Keep the active plan narrow: one core topic, one build artifact, and one review loop per day.

## NPX CLI

Use the NPX CLI:

```bash
npx eduorchestrate
npx eduorchestrate /eduorchestrate
npx eduorchestrate plan --role "Agentic AI and LLM Engineer"
npx eduorchestrate send-today --dry-run
```

The CLI stores local state in `data/` by default:

- `30-day-plan.json`
- `research-digests/*.json`
- generated email previews and runtime outputs

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

## Research Rules

When the learner asks for current technology edge, browse or otherwise verify current sources if the runtime supports it. Every update must include:

- source title
- source URL
- access or publication date
- why it matters to the target role
- one concrete practice task

Do not change the roadmap because a technology is trendy. Change it only when the update improves employability, project quality, interview readiness, or safety.
