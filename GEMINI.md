# Gemini EduOrchestrate Context

Use `/eduorchestrate` as the learner orchestration command.

If slash commands are not registered in the host Gemini runtime, treat `eduorchestrate` or `use EduOrchestrate` as equivalent to `/eduorchestrate`.

Prefer the local NPX CLI for stateful actions:

```bash
npx eduorchestrate
npx eduorchestrate send-today --dry-run
```
