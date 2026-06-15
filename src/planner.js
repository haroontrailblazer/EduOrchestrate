import { inferRoleKey } from "./research.js";

const ROLE_BLUEPRINTS = {
  "agentic-ai": {
    label: "Agentic AI and LLM Engineer",
    capstone: "agentic RAG assistant with evaluation and deployment notes",
    topics: [
      ["Role intro and tool setup", ["Hugging Face", "GitHub", "Google Colab"], "Create accounts, open a Colab notebook, and clone or fork one starter repo."],
      ["Python notebook fluency", ["Python", "Colab", "notebooks"], "Run a notebook that loads data, prints results, and saves notes."],
      ["LLM basics", ["tokens", "context windows", "inference"], "Write a short explanation of how prompts become model outputs."],
      ["Prompt engineering", ["system prompts", "examples", "constraints"], "Build three prompt variants and compare outputs."],
      ["Embeddings", ["vectors", "semantic search", "similarity"], "Create a tiny embedding search demo."],
      ["RAG architecture", ["retrieval", "chunking", "grounding"], "Sketch and implement a minimal RAG pipeline."],
      ["Vector stores", ["FAISS", "Chroma", "metadata"], "Index a small document set and retrieve relevant chunks."],
      ["Hugging Face models", ["transformers", "datasets", "model cards"], "Load a small model or dataset and document constraints."],
      ["Fine-tuning concepts", ["LoRA", "QLoRA", "PEFT"], "Read a fine-tuning tutorial and list hardware limits."],
      ["Colab fine-tuning setup", ["GPU runtime", "datasets", "checkpoints"], "Prepare a dry-run notebook for fine-tuning."],
      ["Evaluation basics", ["golden sets", "metrics", "rubrics"], "Create five test questions and expected traits."],
      ["LLM app backend", ["API", "streaming", "timeouts"], "Create a simple endpoint or script wrapper."],
      ["Agent tools", ["tool calling", "function schema", "state"], "Define two tools and test their input/output contracts."],
      ["Agent planning", ["tasks", "handoffs", "memory"], "Build a simple planner-executor loop."],
      ["Multi-agent workflow", ["researcher", "builder", "evaluator"], "Split one task across three agent roles."],
      ["Safety and guardrails", ["validation", "refusal", "scope"], "Add input checks and output constraints."],
      ["GitHub portfolio hygiene", ["README", "issues", "commits"], "Polish one repo with setup steps and screenshots."],
      ["Deployment basics", ["env vars", "secrets", "hosting"], "Deploy or document a runnable local service."],
      ["Observability", ["logs", "traces", "costs"], "Add structured logs to one agent run."],
      ["RAG improvement", ["reranking", "citations", "chunk tests"], "Improve retrieval quality and show before/after evidence."],
      ["Model comparison", ["latency", "quality", "price"], "Compare two model choices with a small rubric."],
      ["Data preparation", ["cleaning", "splits", "licenses"], "Prepare a tiny dataset and document license concerns."],
      ["Fine-tuning practice", ["training loop", "adapter", "eval"], "Run or dry-run a small adapter training notebook."],
      ["Agent evaluation", ["task success", "regression set", "manual review"], "Create a regression checklist for agent behavior."],
      ["Capstone planning", ["problem", "users", "scope"], "Choose a capstone agent and define the smallest useful version."],
      ["Capstone build day 1", ["architecture", "tools", "data"], "Implement the first end-to-end path."],
      ["Capstone build day 2", ["polish", "errors", "tests"], "Add error handling and tests."],
      ["Capstone evaluation", ["demo", "rubric", "limits"], "Run a demo and document failures."],
      ["Interview story", ["tradeoffs", "metrics", "ownership"], "Write a STAR-style explanation of the capstone."],
      ["Portfolio release", ["README", "demo", "next steps"], "Publish final notes and define the next 30 days."]
    ]
  },
  "full-stack": {
    label: "Full-Stack Developer",
    capstone: "authenticated full-stack dashboard deployed with tests",
    topics: [
      ["Role map and dev setup", ["GitHub", "Node.js", "editor"], "Create a repo, install Node.js, and run a starter web app."],
      ["HTML structure", ["semantic HTML", "forms", "accessibility"], "Build a semantic profile page."],
      ["CSS layout", ["flexbox", "grid", "responsive"], "Make the profile responsive across mobile and desktop."],
      ["JavaScript basics", ["DOM", "events", "state"], "Add interactive filtering or toggles."],
      ["TypeScript basics", ["types", "interfaces", "compiler"], "Convert one script to TypeScript-style typed thinking."],
      ["React components", ["props", "state", "composition"], "Build reusable UI components."],
      ["Routing and pages", ["routes", "navigation", "loading"], "Create a two-page app."],
      ["API design", ["REST", "status codes", "JSON"], "Design and mock a simple API."],
      ["Backend server", ["Node", "handlers", "middleware"], "Create a minimal backend endpoint."],
      ["Database basics", ["tables", "queries", "schema"], "Model one useful table and seed sample rows."],
      ["Auth concepts", ["sessions", "JWT", "permissions"], "Sketch an auth flow and protect one route."],
      ["Form validation", ["client validation", "server validation", "errors"], "Build a robust form with errors."],
      ["Testing basics", ["unit", "integration", "fixtures"], "Write tests for one utility and one API path."],
      ["Deployment", ["env vars", "hosting", "builds"], "Deploy or document deployment for the app."],
      ["Observability", ["logs", "errors", "metrics"], "Add useful logs and error boundaries."],
      ["Performance", ["bundle", "caching", "lazy loading"], "Measure and improve one bottleneck."],
      ["Security basics", ["XSS", "CSRF", "secrets"], "Review the app against common web risks."],
      ["Accessibility pass", ["keyboard", "labels", "contrast"], "Fix three accessibility issues."],
      ["API integration", ["fetch", "loading state", "retry"], "Connect frontend to backend data."],
      ["State management", ["local state", "server state", "cache"], "Clean up app state flow."],
      ["Feature planning", ["user story", "scope", "acceptance"], "Plan the capstone feature."],
      ["Capstone backend", ["schema", "API", "validation"], "Implement the backend for the capstone."],
      ["Capstone frontend", ["components", "forms", "states"], "Implement the frontend for the capstone."],
      ["Capstone testing", ["unit", "integration", "manual QA"], "Add regression coverage."],
      ["Capstone deployment", ["hosting", "env", "domain"], "Deploy or create a reproducible deployment guide."],
      ["Code review", ["readability", "duplication", "errors"], "Refactor one rough section."],
      ["Portfolio README", ["setup", "screenshots", "demo"], "Write a recruiter-friendly README."],
      ["Interview practice", ["architecture", "tradeoffs", "debugging"], "Explain the app architecture aloud."],
      ["Mock task", ["bug fix", "feature request", "deadline"], "Complete a timed practical task."],
      ["Release and next plan", ["release notes", "next steps", "gaps"], "Publish release notes and next 30-day plan."]
    ]
  },
  "cybersecurity": {
    label: "Cybersecurity Analyst",
    capstone: "home SOC investigation report with detections and response notes",
    topics: [
      ["Role map and lab setup", ["Linux", "networking", "GitHub"], "Create a lab notes repo and install basic analysis tools."],
      ["Networking basics", ["IP", "DNS", "HTTP"], "Trace a simple request and document each hop."],
      ["Linux command line", ["files", "processes", "permissions"], "Collect system facts using CLI commands."],
      ["Security fundamentals", ["CIA triad", "risk", "controls"], "Map one common attack to controls."],
      ["Threat modeling", ["assets", "threats", "mitigations"], "Threat-model a login form."],
      ["Logs basics", ["events", "fields", "timestamps"], "Parse a sample log file."],
      ["SIEM thinking", ["queries", "alerts", "triage"], "Write three detection-style queries in plain language."],
      ["MITRE ATT&CK", ["tactics", "techniques", "procedures"], "Map one incident scenario to ATT&CK."],
      ["Phishing triage", ["headers", "URLs", "attachments"], "Write a phishing investigation checklist."],
      ["Endpoint basics", ["processes", "persistence", "artifacts"], "Document suspicious endpoint indicators."],
      ["Vulnerability basics", ["CVEs", "CVSS", "patching"], "Summarize one recent advisory."],
      ["Web security", ["XSS", "SQLi", "auth"], "Test a deliberately vulnerable sample safely."],
      ["Incident response", ["identify", "contain", "eradicate"], "Draft a response playbook."],
      ["Detection engineering", ["signal", "noise", "false positives"], "Improve one noisy alert rule."],
      ["Cloud basics", ["IAM", "logs", "storage"], "Review a mock cloud permissions issue."],
      ["Security automation", ["Python", "parsing", "reporting"], "Write a small log summarizer."],
      ["Evidence handling", ["timeline", "notes", "chain"], "Build an incident timeline."],
      ["SOC communication", ["severity", "impact", "next action"], "Write a concise escalation note."],
      ["Malware basics", ["hashes", "sandbox", "IOCs"], "Create a safe malware-analysis glossary."],
      ["Blue-team project plan", ["data", "detections", "report"], "Plan the capstone investigation."],
      ["Capstone data collection", ["logs", "events", "sources"], "Collect or create sample log data."],
      ["Capstone detection", ["query", "alert", "triage"], "Implement one detection workflow."],
      ["Capstone analysis", ["timeline", "IOCs", "scope"], "Analyze the sample incident."],
      ["Capstone report", ["summary", "evidence", "recommendations"], "Write the first report draft."],
      ["Capstone improvement", ["false positives", "coverage", "limits"], "Improve detection quality."],
      ["Portfolio polish", ["README", "screenshots", "safe data"], "Publish sanitized project evidence."],
      ["Interview scenarios", ["triage", "escalation", "tradeoffs"], "Practice three SOC interview prompts."],
      ["Current threats", ["advisories", "patches", "impact"], "Summarize one current CISA advisory."],
      ["Mock shift", ["alerts", "notes", "handoff"], "Complete a timed triage simulation."],
      ["Release and next plan", ["gaps", "certs", "labs"], "Define the next 30-day security path."]
    ]
  },
  "data-science": {
    label: "Data Scientist",
    capstone: "end-to-end analysis notebook with model, metrics, and stakeholder summary",
    topics: [
      ["Role map and notebook setup", ["Python", "Jupyter", "GitHub"], "Create a notebook repo and run a starter analysis."],
      ["Python data basics", ["lists", "dicts", "functions"], "Write utilities for simple data transformations."],
      ["pandas basics", ["DataFrame", "filtering", "groupby"], "Analyze a small CSV."],
      ["Data cleaning", ["missing values", "types", "outliers"], "Clean a messy sample dataset."],
      ["Visualization basics", ["charts", "labels", "story"], "Create three useful charts."],
      ["Statistics basics", ["mean", "variance", "distribution"], "Explain one dataset statistically."],
      ["SQL basics", ["select", "join", "aggregate"], "Answer five questions with SQL."],
      ["Feature engineering", ["encoding", "scaling", "leakage"], "Create features and document risks."],
      ["Train/test split", ["validation", "leakage", "baseline"], "Create a baseline model."],
      ["Regression", ["loss", "features", "residuals"], "Train and evaluate a regression model."],
      ["Classification", ["precision", "recall", "confusion matrix"], "Train and evaluate a classifier."],
      ["Model evaluation", ["metrics", "tradeoffs", "thresholds"], "Compare two models."],
      ["Notebook hygiene", ["sections", "reproducibility", "outputs"], "Refactor a notebook for readability."],
      ["Experiment tracking", ["parameters", "results", "notes"], "Create a simple experiment log."],
      ["Communication", ["summary", "audience", "decision"], "Write a stakeholder summary."],
      ["Ethics and bias", ["sampling", "fairness", "limits"], "Document dataset limitations."],
      ["Deployment thinking", ["batch", "API", "monitoring"], "Sketch how the model would be used."],
      ["Portfolio project plan", ["question", "data", "metric"], "Plan the capstone analysis."],
      ["Capstone data collection", ["source", "license", "schema"], "Choose and document a dataset."],
      ["Capstone cleaning", ["quality", "types", "missing"], "Clean the capstone dataset."],
      ["Capstone EDA", ["patterns", "segments", "charts"], "Create the first analysis story."],
      ["Capstone modeling", ["baseline", "metric", "validation"], "Train a baseline model."],
      ["Capstone improvement", ["features", "tuning", "comparison"], "Improve and compare the model."],
      ["Capstone explanation", ["importance", "limits", "risks"], "Explain model behavior and limits."],
      ["Capstone report", ["executive summary", "charts", "recommendations"], "Write the report draft."],
      ["Portfolio README", ["setup", "dataset", "results"], "Create a professional project README."],
      ["Interview practice", ["case study", "metrics", "tradeoffs"], "Answer three data-science interview prompts."],
      ["Current tools", ["libraries", "MLOps", "LLMs"], "Research one current data tooling update."],
      ["Mock task", ["analysis", "timebox", "recommendation"], "Complete a timed mini analysis."],
      ["Release and next plan", ["gaps", "projects", "interviews"], "Define the next 30-day data path."]
    ]
  }
};

export function generate30DayPlan(profile) {
  const role = profile.targetRole || "Agentic AI and LLM Engineer";
  const roleKey = inferRoleKey(role);
  const blueprint = ROLE_BLUEPRINTS[roleKey] || ROLE_BLUEPRINTS["agentic-ai"];
  const requestedDays = Math.max(30, Number.parseInt(profile.planDays, 10) || 30);
  const primarySkill = profile.focusSkill || blueprint.topics[0][0];
  const topics = prioritizeTopics(blueprint.topics, primarySkill, requestedDays, role);
  return {
    generatedAt: new Date().toISOString(),
    command: "/eduorchestrate",
    learner: profile,
    roleKey,
    requestedDays,
    primarySkill,
    currentLearning: profile.currentLearning || "not specified",
    capstone: blueprint.capstone,
    phases: createPhases(requestedDays),
    days: topics.slice(0, requestedDays).map(([title, concepts, task], index) => buildDay(index + 1, role, title, concepts, task, blueprint, primarySkill)),
    nextSkillRecommendation: recommendNextSkill(roleKey, primarySkill, blueprint, requestedDays)
  };
}

function buildDay(day, role, title, concepts, task, blueprint, primarySkill) {
  const query = encodeURIComponent(`${role} ${title} tutorial`);
  const codeQuery = encodeURIComponent(`${role} ${title} sample code GitHub`);
  const docsQuery = encodeURIComponent(`${role} ${concepts.join(" ")} official docs`);
  const difficulty = day <= 7 ? "foundation" : day <= 15 ? "applied" : day <= 24 ? "portfolio" : day <= 30 ? "release" : "next-skill-ramp";
  const trendQuery = encodeURIComponent(`${role} ${title} ${primarySkill} trending tools 2026`);
  return {
    day,
    title,
    difficulty,
    goal: `Move toward ${role} by completing one focused artifact for ${title}.`,
    primarySkill,
    concepts,
    setupOrBuildTask: task,
    timeBox: {
      learnMinutes: day <= 7 ? 35 : 25,
      buildMinutes: day <= 7 ? 45 : 70,
      reviewMinutes: 15
    },
    references: [
      { type: "docs-search", title: "Official docs search", url: `https://www.google.com/search?q=${docsQuery}` },
      { type: "trend-search", title: "Trending knowledge search", url: `https://www.google.com/search?q=${trendQuery}` },
      { type: "video-search", title: "YouTube tutorial search", url: `https://www.youtube.com/results?search_query=${query}` },
      { type: "code-search", title: "GitHub sample code search", url: `https://github.com/search?q=${codeQuery}&type=repositories` }
    ],
    proof: "Save notes, code, screenshot, log, or demo output that proves today's task was attempted.",
    portfolioArtifact: day >= 16 ? `Improve the ${blueprint.capstone}.` : "Add one small note or commit that can feed the capstone later.",
    reviewQuestions: [
      "What did I build or prove today?",
      "What is the most important blocker?",
      "What should tomorrow preserve or change?"
    ],
    stretch: day % 3 === 0 ? "Explain today's work in 5 bullet points as if answering an interview question." : "Skip stretch work unless the base proof is complete.",
    nextDayBridge: "Write one blocker and one question to carry into tomorrow."
  };
}

function prioritizeTopics(topics, primarySkill, requestedDays, role) {
  const lowered = primarySkill.toLowerCase();
  const setup = topics[0];
  const body = topics.slice(1);
  const matching = body.filter(([title, concepts]) => `${title} ${concepts.join(" ")}`.toLowerCase().includes(lowered));
  const remaining = body.filter((topic) => !matching.includes(topic));
  const focusIntro = [`Primary skill focus: ${primarySkill}`, [primarySkill, "current trends", "practical proof"], `Build a first visible artifact for ${primarySkill} in the ${role} role.`];
  const ordered = [setup, ...(matching.length ? matching : [focusIntro]), ...remaining];
  const expanded = [...ordered];
  while (expanded.length < requestedDays) {
    const index = expanded.length + 1;
    expanded.push([
      `Next-skill adaptation day ${index}`,
      [primarySkill, "trend adaptation", "portfolio evidence"],
      `Review current trends for ${primarySkill}, upgrade the capstone, and log evidence for what changed.`
    ]);
  }
  return expanded;
}

function createPhases(days) {
  return [
    { days: `1-${Math.min(7, days)}`, name: "Setup and first-skill foundations" },
    { days: `8-${Math.min(15, days)}`, name: "Applied practice and trend adaptation" },
    { days: `16-${Math.min(24, days)}`, name: "Portfolio build" },
    { days: `25-${Math.min(30, days)}`, name: "Release and interview proof" },
    ...(days > 30 ? [{ days: `31-${days}`, name: "Next-skill ramp and trend refresh" }] : [])
  ].filter((phase) => !phase.days.includes("8-7") && !phase.days.includes("16-15") && !phase.days.includes("25-24"));
}

function recommendNextSkill(roleKey, primarySkill, blueprint, requestedDays) {
  const flattened = blueprint.topics.flatMap(([, concepts]) => concepts);
  const next = flattened.find((concept) => concept.toLowerCase() !== primarySkill.toLowerCase()) || "capstone deployment and interview proof";
  const roleSpecific = {
    "agentic-ai": "LLM evaluation and production agent observability",
    "full-stack": "backend reliability, auth, and deployment automation",
    cybersecurity: "detection engineering and incident reporting",
    "data-science": "model evaluation, communication, and deployment thinking"
  };
  return {
    afterDay: requestedDays,
    currentFocus: primarySkill,
    recommendedNextSkill: roleSpecific[roleKey] || next,
    reason: `After at least ${requestedDays} days on ${primarySkill}, move to a skill that improves portfolio depth, current-market relevance, and interview proof.`
  };
}

export function renderDailyEmail(config, plan, dayNumber, { progressReview = null, researchDigest = null, progressionCard = null, coursePack = null } = {}) {
  const day = plan.days.find((entry) => entry.day === dayNumber) || plan.days[0];
  const references = day.references.map((ref) => `- ${ref.title}: ${ref.url}`).join("\n");
  const timeBox = `Learn ${day.timeBox.learnMinutes}m, build ${day.timeBox.buildMinutes}m, review ${day.timeBox.reviewMinutes}m`;
  const research = researchDigest
    ? ["", "Fresh research digest:", `Topic: ${researchDigest.topic}`, ...researchDigest.sources.slice(0, 5).map((source) => `- ${source.title}: ${source.url}`)]
    : [];
  const topLinkLines = [];
  if (researchDigest?.topVideo?.url) topLinkLines.push(`Watch (video): ${researchDigest.topVideo.url}`);
  if (researchDigest?.topRepo?.url) topLinkLines.push(`Build from (repo): ${researchDigest.topRepo.url}`);
  if (researchDigest?.topDoc?.url) topLinkLines.push(`Read (docs): ${researchDigest.topDoc.url}`);
  const topLinks = topLinkLines.length ? ["", "Today's links (open these first):", ...topLinkLines] : [];
  const progress = progressReview
    ? ["", "Progress signal:", `Momentum: ${progressReview.momentum}`, `Next action: ${progressReview.nextAction}`, `Risk: ${progressReview.risk}`]
    : [];
  const card = progressionCard
    ? ["", "Skill learning progression card:", progressionCard.markdown]
    : [];
  const courses = coursePack
    ? [
        "",
        "Role-specific learning sources:",
        ...coursePack.recommendedSources.slice(0, 2).map((source) => `- ${source.title}: ${source.url}`),
        "Newsletters/update feeds:",
        ...coursePack.newsletters.slice(0, 2).map((source) => `- ${source.title}: ${source.url}`),
        "Full source pack: data/learning-sources.md"
      ]
    : [];
  const text = [
      `Hi ${config.learner.name},`,
      "",
      `Today is Day ${day.day} for your ${config.learner.targetRole} path.`,
      `Current learning: ${config.learner.currentLearning || "not specified"}`,
      `Primary skill focus: ${day.primarySkill}`,
      "",
      `Goal: ${day.goal}`,
      `Difficulty: ${day.difficulty}`,
      `Timebox: ${timeBox}`,
      `Concepts: ${day.concepts.join(", ")}`,
      `Build task: ${day.setupOrBuildTask}`,
      `Portfolio link: ${day.portfolioArtifact}`,
      ...topLinks,
      "",
      "References to research:",
      references,
      ...research,
      "",
      `Proof: ${day.proof}`,
      `Stretch: ${day.stretch}`,
      "Review questions:",
      ...day.reviewQuestions.map((question) => `- ${question}`),
      ...progress,
      ...courses,
      ...card,
      "",
      `Bridge: ${day.nextDayBridge}`,
      "",
      "Use /eduorchestrate in your agent to adjust the plan or review progress."
    ].join("\n");
  const html = renderDailyEmailHtml({ config, day, timeBox, researchDigest, progressReview, progressionCard, coursePack });
  return {
    to: config.learner.email,
    subject: `EduOrchestrate Day ${day.day}: ${day.title}`,
    text,
    html
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderDailyEmailHtml({ config, day, timeBox, researchDigest, progressReview, progressionCard, coursePack }) {
  const orange = "#e97926";
  const muted = "#9c9188";
  const ink = "#2a2520";

  const button = (label, url) =>
    `<a href="${escapeHtml(url)}" style="display:inline-block;margin:0 8px 8px 0;padding:11px 16px;background:${orange};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">${escapeHtml(label)}</a>`;

  const buttons = [];
  if (researchDigest?.topVideo?.url) buttons.push(button("Watch the top video", researchDigest.topVideo.url));
  if (researchDigest?.topRepo?.url) buttons.push(button("Open the top repo", researchDigest.topRepo.url));
  if (researchDigest?.topDoc?.url) buttons.push(button("Read the docs", researchDigest.topDoc.url));
  const buttonsBlock = buttons.length
    ? `<div style="margin:4px 0 18px;">${buttons.join("")}</div>`
    : "";

  const link = (label, url) => `<a href="${escapeHtml(url)}" style="color:${orange};text-decoration:none;">${escapeHtml(label)}</a>`;
  const listItems = (items) => items.map((line) => `<li style="margin:4px 0;">${line}</li>`).join("");

  const moreVideos = (researchDigest?.videos || []).slice(1, 3).map((video) => link(video.title || video.url, video.url));
  const moreRepos = (researchDigest?.repos || []).slice(1, 3).map((repo) => link(`${repo.title}${repo.stars != null ? ` (★${repo.stars})` : ""}`, repo.url));
  const moreLinks = [...moreVideos, ...moreRepos];
  const moreBlock = moreLinks.length
    ? `<p style="margin:16px 0 4px;font-weight:600;font-size:14px;">More to skim</p><ul style="margin:0 0 8px;padding-left:18px;font-size:14px;color:${ink};">${listItems(moreLinks)}</ul>`
    : "";

  const refs = day.references.map((ref) => link(ref.title, ref.url));
  const refsBlock = `<p style="margin:16px 0 4px;font-weight:600;font-size:14px;">Research entry points</p><ul style="margin:0 0 8px;padding-left:18px;font-size:14px;color:${ink};">${listItems(refs)}</ul>`;

  const facts = [
    ["Difficulty", day.difficulty],
    ["Timebox", timeBox],
    ["Concepts", day.concepts.join(", ")],
    ["Build task", day.setupOrBuildTask],
    ["Portfolio", day.portfolioArtifact]
  ]
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:${muted};font-size:13px;vertical-align:top;white-space:nowrap;">${k}</td><td style="padding:4px 0;font-size:14px;color:${ink};">${escapeHtml(v)}</td></tr>`)
    .join("");

  const progressBlock = progressReview
    ? `<p style="margin:16px 0 4px;font-weight:600;font-size:14px;">Progress signal</p><p style="margin:0;font-size:14px;color:${ink};">Momentum: <b>${escapeHtml(progressReview.momentum)}</b> · Next: ${escapeHtml(progressReview.nextAction)}</p>`
    : "";

  const coursesBlock = coursePack
    ? `<p style="margin:16px 0 4px;font-weight:600;font-size:14px;">Official learning sources</p><ul style="margin:0 0 8px;padding-left:18px;font-size:14px;color:${ink};">${listItems(coursePack.recommendedSources.slice(0, 2).map((s) => link(s.title, s.url)))}</ul>`
    : "";

  const cardBlock = progressionCard
    ? `<p style="margin:16px 0 4px;font-weight:600;font-size:14px;">Progression card</p><pre style="margin:0;padding:14px;background:#0d1117;color:#c9d1d9;border-radius:10px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;line-height:1.5;overflow:auto;white-space:pre-wrap;">${escapeHtml(progressionCard.terminalLines ? progressionCard.terminalLines.join("\n") : progressionCard.markdown)}</pre>`
    : "";

  const questions = `<p style="margin:16px 0 4px;font-weight:600;font-size:14px;">Review questions</p><ul style="margin:0;padding-left:18px;font-size:14px;color:${ink};">${listItems(day.reviewQuestions.map(escapeHtml))}</ul>`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f4f1ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${ink};">
  <div style="max-width:640px;margin:0 auto;padding:24px 16px;">
    <div style="background:#ffffff;border:1px solid #e2d8cf;border-radius:14px;overflow:hidden;">
      <div style="background:#0d1117;padding:14px 22px;color:#c9d1d9;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;">&gt;_ eduorchestrate — day ${day.day}</div>
      <div style="padding:22px;">
        <p style="margin:0 0 4px;color:${muted};font-size:13px;">Hi ${escapeHtml(config.learner.name)} — Day ${day.day} of your ${escapeHtml(config.learner.targetRole)} path.</p>
        <h1 style="margin:6px 0 8px;font-size:22px;line-height:1.2;color:#0a0a0a;">${escapeHtml(day.title)}</h1>
        <p style="margin:0 0 16px;color:#5e554d;font-size:15px;">${escapeHtml(day.goal)}</p>
        ${buttonsBlock}
        <table style="border-collapse:collapse;margin:4px 0 4px;">${facts}</table>
        ${moreBlock}
        ${refsBlock}
        ${progressBlock}
        ${coursesBlock}
        ${cardBlock}
        ${questions}
        <p style="margin:18px 0 0;font-size:14px;color:#5e554d;">Bridge: ${escapeHtml(day.nextDayBridge)}</p>
      </div>
    </div>
    <p style="text-align:center;color:${muted};font-size:12px;margin:14px 0 0;">Use <b>/eduorchestrate</b> in your agent to adjust the plan or review progress.</p>
  </div>
</body></html>`;
}
