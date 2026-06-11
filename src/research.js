import path from "node:path";
import { fileSafeDate, readJson, resolveDataDir, writeJson } from "./config.js";

const OFFICIAL_SOURCE_SEEDS = {
  "agentic-ai": [
    ["OpenAI platform docs", "https://platform.openai.com/docs"],
    ["Hugging Face docs", "https://huggingface.co/docs"],
    ["LangChain docs", "https://python.langchain.com/docs/"],
    ["LlamaIndex docs", "https://docs.llamaindex.ai/"]
  ],
  "full-stack": [
    ["MDN Web Docs", "https://developer.mozilla.org/"],
    ["React docs", "https://react.dev/"],
    ["Node.js learn", "https://nodejs.org/en/learn"],
    ["PostgreSQL docs", "https://www.postgresql.org/docs/"]
  ],
  "cybersecurity": [
    ["CISA advisories", "https://www.cisa.gov/news-events/cybersecurity-advisories"],
    ["MITRE ATT&CK", "https://attack.mitre.org/"],
    ["OWASP Top 10", "https://owasp.org/www-project-top-ten/"],
    ["NIST Cybersecurity Framework", "https://www.nist.gov/cyberframework"]
  ],
  "data-science": [
    ["pandas docs", "https://pandas.pydata.org/docs/"],
    ["scikit-learn user guide", "https://scikit-learn.org/stable/user_guide.html"],
    ["Kaggle learn", "https://www.kaggle.com/learn"],
    ["Jupyter docs", "https://docs.jupyter.org/"]
  ]
};

export function createResearchDigest({ config, topic, day = null, roleKey = null }) {
  const role = config.learner.targetRole;
  const key = roleKey || inferRoleKey(role);
  const query = topic || role;
  const sources = [
    ...seedSources(key),
    searchSource("YouTube tutorial search", "https://www.youtube.com/results?search_query=", `${role} ${query} tutorial`),
    searchSource("GitHub sample-code search", "https://github.com/search?q=", `${role} ${query} sample code`, "&type=repositories"),
    searchSource("Google docs/reference search", "https://www.google.com/search?q=", `${role} ${query} official docs`),
    searchSource("Trend scan search", "https://www.google.com/search?q=", `${role} ${query} trending tools best practices 2026`),
    searchSource("Recent discussions search", "https://www.google.com/search?q=", `${role} ${query} site:news.ycombinator.com OR site:reddit.com`)
  ];
  return {
    generatedAt: new Date().toISOString(),
    targetRole: role,
    topic: query,
    day,
    rule: "Use these as research and trend-scanning entry points. Do not claim a specific video, repository, or trend is recommended until an agent verifies it.",
    sources,
    trendAdaptation: `Check whether any current tool, release, framework, model, or workflow materially changes how ${query} should be practiced.`,
    practiceTask: `Find one trustworthy reference for ${query}, extract three implementation notes, then apply one note to today's build artifact.`
  };
}

export function saveResearchDigest(config, digest) {
  const dataDir = resolveDataDir(config);
  const filename = `${slug(digest.topic)}-${fileSafeDate()}.json`;
  const relativePath = path.join("research-digests", filename);
  writeJson(path.join(dataDir, relativePath), digest);
  return path.join("data", relativePath);
}

export function loadLatestDigest(config) {
  const dataDir = resolveDataDir(config);
  const digests = readJson(path.join(dataDir, "research-index.json"), []);
  return digests.at(-1) || null;
}

export function appendResearchIndex(config, digestPath, digest) {
  const dataDir = resolveDataDir(config);
  const indexPath = path.join(dataDir, "research-index.json");
  const existing = readJson(indexPath, []);
  existing.push({
    path: digestPath,
    topic: digest.topic,
    day: digest.day,
    generatedAt: digest.generatedAt,
    sourceCount: digest.sources.length
  });
  writeJson(indexPath, existing);
}

export function inferRoleKey(role) {
  if (/agentic|llm|ai engineer|artificial intelligence|machine learning/i.test(role)) return "agentic-ai";
  if (/full.?stack|frontend|backend|web/i.test(role)) return "full-stack";
  if (/cyber|security|soc|threat/i.test(role)) return "cybersecurity";
  if (/data scientist|data science|analytics|ml engineer/i.test(role)) return "data-science";
  return "agentic-ai";
}

function seedSources(key) {
  return (OFFICIAL_SOURCE_SEEDS[key] || OFFICIAL_SOURCE_SEEDS["agentic-ai"]).map(([title, url]) => ({
    type: "official",
    title,
    url,
    relevance: "Official or reputable source to verify current tooling and implementation details."
  }));
}

function searchSource(title, baseUrl, query, suffix = "") {
  return {
    type: "search",
    title,
    url: `${baseUrl}${encodeURIComponent(query)}${suffix}`,
    relevance: "Search entry point for current references; verify results before treating them as recommendations."
  };
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "research";
}
