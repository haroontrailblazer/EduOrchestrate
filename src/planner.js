const AGENTIC_AI_TOPICS = [
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
];

export function generate30DayPlan(profile) {
  const role = profile.targetRole || "Agentic AI and LLM Engineer";
  const agentic = /agentic|llm|ai engineer|artificial intelligence/i.test(role);
  const topics = agentic ? AGENTIC_AI_TOPICS : genericTopics(role);
  return {
    generatedAt: new Date().toISOString(),
    command: "/eduorchestrate",
    learner: profile,
    days: topics.slice(0, 30).map(([title, concepts, task], index) => buildDay(index + 1, role, title, concepts, task))
  };
}

function buildDay(day, role, title, concepts, task) {
  const query = encodeURIComponent(`${role} ${title} tutorial`);
  const codeQuery = encodeURIComponent(`${role} ${title} sample code GitHub`);
  const docsQuery = encodeURIComponent(`${role} ${concepts.join(" ")} official docs`);
  return {
    day,
    title,
    goal: `Move toward ${role} by completing one focused artifact for ${title}.`,
    concepts,
    setupOrBuildTask: task,
    references: [
      { type: "docs-search", title: "Official docs search", url: `https://www.google.com/search?q=${docsQuery}` },
      { type: "video-search", title: "YouTube tutorial search", url: `https://www.youtube.com/results?search_query=${query}` },
      { type: "code-search", title: "GitHub sample code search", url: `https://github.com/search?q=${codeQuery}&type=repositories` }
    ],
    proof: "Save notes, code, screenshot, log, or demo output that proves today's task was attempted.",
    nextDayBridge: "Write one blocker and one question to carry into tomorrow."
  };
}

function genericTopics(role) {
  return Array.from({ length: 30 }, (_, index) => [
    `${role} skill block ${index + 1}`,
    ["fundamentals", "practice", "portfolio evidence"],
    `Complete one practical task connected to ${role} and document the evidence.`
  ]);
}

export function renderDailyEmail(config, plan, dayNumber) {
  const day = plan.days.find((entry) => entry.day === dayNumber) || plan.days[0];
  const references = day.references.map((ref) => `- ${ref.title}: ${ref.url}`).join("\n");
  return {
    to: config.learner.email,
    subject: `EduOrchestrate Day ${day.day}: ${day.title}`,
    text: [
      `Hi ${config.learner.name},`,
      "",
      `Today is Day ${day.day} for your ${config.learner.targetRole} path.`,
      "",
      `Goal: ${day.goal}`,
      `Concepts: ${day.concepts.join(", ")}`,
      `Build task: ${day.setupOrBuildTask}`,
      "",
      "References to research:",
      references,
      "",
      `Proof: ${day.proof}`,
      `Bridge: ${day.nextDayBridge}`,
      "",
      "Use /eduorchestrate in your agent to adjust the plan or review progress."
    ].join("\n")
  };
}
