---
description: EduOrchestrate: log today's progress with evidence
argument-hint: <what you did> | <evidence link>
allowed-tools: Bash(npx eduorchestrate log-progress:*), Bash(npx eduorchestrate status:*)
---
Log the learner's progress. Read what they completed and an evidence link/path from "$ARGUMENTS". If either is missing, ASK for it — never log a placeholder entry. Read the current day from `npx eduorchestrate status`, then run `npx eduorchestrate log-progress --day <day> --completed "<note>" --evidence "<link>"` (optionally --confidence <1-5>) and confirm the updated momentum.
