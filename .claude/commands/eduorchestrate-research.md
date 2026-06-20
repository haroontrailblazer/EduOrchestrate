---
description: EduOrchestrate: resolve today's sourced links (video, docs, repo)
argument-hint: [day]
allowed-tools: Bash(npx eduorchestrate research:*), Bash(npx eduorchestrate status:*)
---
Resolve the learner's research links. If "$ARGUMENTS" contains a day number use it, otherwise read the current day from `npx eduorchestrate status`. Then run `npx eduorchestrate research --day <day>` and present the resolved top YouTube video link (with its title), the official docs, and the GitHub repo result. Keep it short and link-first.
