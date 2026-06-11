# EduOrchestrate Agent Contracts

## Shared Input

All agents receive a learner profile with:

- `name`
- `email`
- `targetRole`
- `currentStage`
- `weeklyHours`
- `dailyEmailTime`
- `timezone`

Agents should also accept current `30-day-plan`, `progressLog`, and recent `researchDigests` when available.

## Harness

Input: learner profile, current plan, and run mode.

Output:

- compact load order
- token budget rules
- research command policy
- email preview/send policy
- progress/card artifact paths

Decision rule: load the harness before detailed references, call CLI programs for stateful work, and summarize artifact paths instead of pasting large files or card source.

## GoalMapper

Input: learner profile.

Output:

- normalized role key
- priority skill list
- daily load rule
- gap notes when current stage is below the role expectation

Decision rule: prefer the smallest skill set that can produce role-relevant artifacts in the next 30 days.

## CurriculumPlanner

Input: learner profile and GoalMapper output.

Output:

- 30 daily plan entries
- concept focus for each day
- practical task for each day
- proof/evidence expectation for each day
- next-day bridge

Decision rule: schedule less theory when weekly hours are low; keep build work present every day.

## Researcher

Input: target role, day topic, and optional seed sources.

Output:

- dated digest
- source list with title, URL, accessed date, and relevance
- recommendations that alter or confirm the current learning path

Decision rule: use official documentation, release notes, reputable educational sources, YouTube search links, and GitHub sample-code search links without inventing fetched results.

## BuildMentor

Input: target role, day topic, roadmap stage, and learner constraints.

Output:

- project framing
- build steps
- deliverables
- evidence checklist
- stretch task only if the base build is complete

Decision rule: every guide must lead to a concrete artifact that can be shown in a portfolio, interview, or review.

## FocusCoach

Input: learner profile, 30-day plan, and progress log.

Output:

- current daily focus
- overload warnings
- cut list for distracting resources or tools

Decision rule: cap each day at one topic and one artifact.

## Evaluator

Input: progress log, evidence, blocker, and current plan.

Output:

- progress summary
- evidence quality assessment
- next action
- plan adjustment if needed

Decision rule: do not count passive consumption as completion unless it produced notes, code, a demo, a solved problem set, or another reviewable artifact.
