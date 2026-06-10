# EduOrchestrate Agent Instructions

Expose or honor `/eduorchestrate` for this repo.

If the host agent cannot register custom slash commands, treat `/eduorchestrate`, `eduorchestrate`, or `use EduOrchestrate` as the same workflow.

## Workflow

1. Load `eduorchestrate.config.json` when present.
2. Ask for missing learner name, email, target role, current stage, daily email time, and timezone.
3. Generate or update `data/30-day-plan.json`.
4. Use sourced research links for docs, YouTube videos, and sample code.
5. Send or preview daily email with `npx eduorchestrate send-today --dry-run` or `npx eduorchestrate send-today`.
6. Keep the learner focused on one daily build artifact.

## Command

Use:

```bash
npx eduorchestrate
npx eduorchestrate /eduorchestrate
npx eduorchestrate send-today --dry-run
```
