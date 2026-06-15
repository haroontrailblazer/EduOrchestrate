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
    rule: "Use these as research and trend-scanning entry points. Resolved links (topVideo/topRepo) are the current top results; skim and verify them before treating them as endorsements.",
    sources,
    topDoc: sources.find((source) => source.type === "official") || sources[0] || null,
    topVideo: null,
    topRepo: null,
    liveResolved: false,
    trendAdaptation: `Check whether any current tool, release, framework, model, or workflow materially changes how ${query} should be practiced.`,
    practiceTask: `Watch the resolved top video, read the resolved top repo, extract three implementation notes, then apply one note to today's build artifact.`
  };
}

// ---------------------------------------------------------------------------
// Live link resolution (dependency-free, uses Node 18+ global fetch).
// Turns search entry points into concrete, shareable links for the daily
// email. Every resolver fails soft: on any error/timeout/offline it returns
// the search URL so the workflow never breaks.
// ---------------------------------------------------------------------------

const FETCH_TIMEOUT_MS = 7000;
const RESOLVER_UA = "Mozilla/5.0 (compatible; EduOrchestrate link resolver)";

export function isLinkResolutionOffline(options = {}) {
  return options.offline === true
    || process.env.EDUORCHESTRATE_OFFLINE === "1"
    || typeof fetch !== "function";
}

async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: { "user-agent": RESOLVER_UA, ...(init.headers || {}) }
    });
  } finally {
    clearTimeout(timer);
  }
}

function ytSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function ghSearchUrl(query) {
  return `https://github.com/search?q=${encodeURIComponent(query)}&type=repositories`;
}

// Resolve up to `limit` concrete YouTube videos. Prefers the official
// YouTube Data API when YOUTUBE_API_KEY is set (durable, structured), and
// otherwise scrapes the results page. Returns [] on any failure.
export async function resolveVideos(query, limit = 3) {
  const key = process.env.YOUTUBE_API_KEY;
  try {
    if (key) {
      const viaApi = await resolveVideosViaApi(query, limit, key);
      if (viaApi && viaApi.length) return viaApi;
    }
    const response = await fetchWithTimeout(`${ytSearchUrl(query)}&hl=en&gl=US`, {
      headers: { "accept-language": "en-US,en;q=0.9" }
    });
    if (!response.ok) return [];
    return extractVideos(await response.text(), limit);
  } catch {
    return [];
  }
}

async function resolveVideosViaApi(query, limit, key) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${limit}&q=${encodeURIComponent(query)}&key=${key}`;
  const response = await fetchWithTimeout(url);
  if (!response.ok) return null;
  const data = await response.json();
  return (data.items || [])
    .filter((item) => item.id && item.id.videoId)
    .map((item) => ({ title: item.snippet?.title || "YouTube result", url: `https://www.youtube.com/watch?v=${item.id.videoId}`, videoId: item.id.videoId }));
}

function extractVideos(html, limit) {
  const seen = new Set();
  const out = [];
  const re = /"videoId":"([\w-]{11})"/g;
  let match;
  while ((match = re.exec(html)) && out.length < limit) {
    const id = match[1];
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({ title: extractVideoTitleAt(html, match.index), url: `https://www.youtube.com/watch?v=${id}`, videoId: id });
  }
  return out;
}

function extractVideoTitleAt(html, index) {
  try {
    const slice = html.slice(index, index + 1500);
    const raw = (slice.match(/"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/)
      || slice.match(/"title":\{[^}]*?"simpleText":"((?:[^"\\]|\\.)*)"/) || [])[1];
    return raw ? JSON.parse(`"${raw}"`) : "Top YouTube result";
  } catch {
    return "Top YouTube result";
  }
}

export async function resolveTopVideo(query) {
  const list = await resolveVideos(query, 1);
  if (!list.length) return videoFallback(ytSearchUrl(query));
  return { resolved: true, type: "video", searchUrl: ytSearchUrl(query), ...list[0] };
}

function videoFallback(searchUrl) {
  return { resolved: false, type: "video", title: "YouTube search (verify a result)", url: searchUrl, searchUrl };
}

// Resolve up to `limit` concrete GitHub repositories via the public search
// API (uses GITHUB_TOKEN/GH_TOKEN when present to raise rate limits).
export async function resolveRepos(query, limit = 3) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  try {
    const response = await fetchWithTimeout(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${limit}`,
      { headers: { accept: "application/vnd.github+json", ...(token ? { authorization: `Bearer ${token}` } : {}) } }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return (data.items || []).map((item) => ({ title: item.full_name, url: item.html_url, stars: item.stargazers_count, description: item.description || "" }));
  } catch {
    return [];
  }
}

export async function resolveTopRepo(query) {
  const list = await resolveRepos(query, 1);
  if (!list.length) return repoFallback(ghSearchUrl(query));
  return { resolved: true, type: "repo", searchUrl: ghSearchUrl(query), ...list[0] };
}

function repoFallback(searchUrl) {
  return { resolved: false, type: "repo", title: "GitHub search (verify a result)", url: searchUrl, searchUrl };
}

export async function enrichDigestLinks(digest, options = {}) {
  const role = digest.targetRole || "";
  const topic = digest.topic || role;
  const videoQuery = `${role} ${topic} tutorial`;
  const repoQuery = `${topic} ${role}`;
  if (isLinkResolutionOffline(options)) {
    digest.topVideo = videoFallback(ytSearchUrl(videoQuery));
    digest.topRepo = repoFallback(ghSearchUrl(repoQuery));
    digest.videos = [];
    digest.repos = [];
    digest.liveResolved = false;
    return digest;
  }
  const limit = Number(options.limit) || 3;
  const [videos, repos] = await Promise.all([resolveVideos(videoQuery, limit), resolveRepos(repoQuery, limit)]);
  digest.videos = videos;
  digest.repos = repos;
  digest.topVideo = videos[0] ? { resolved: true, type: "video", searchUrl: ytSearchUrl(videoQuery), ...videos[0] } : videoFallback(ytSearchUrl(videoQuery));
  digest.topRepo = repos[0] ? { resolved: true, type: "repo", searchUrl: ghSearchUrl(repoQuery), ...repos[0] } : repoFallback(ghSearchUrl(repoQuery));
  digest.liveResolved = Boolean(videos.length || repos.length);
  const resolvedSources = [];
  if (digest.topVideo.resolved) {
    resolvedSources.push({
      type: "resolved-video",
      title: `Top video: ${digest.topVideo.title}`,
      url: digest.topVideo.url,
      relevance: "Resolved top YouTube result for this topic. Skim it, then apply one idea to today's build."
    });
  }
  if (digest.topRepo.resolved) {
    resolvedSources.push({
      type: "resolved-repo",
      title: `Top repo: ${digest.topRepo.title} (★${digest.topRepo.stars})`,
      url: digest.topRepo.url,
      relevance: "Resolved top GitHub repository for this topic. Read the README and borrow one pattern."
    });
  }
  if (resolvedSources.length) digest.sources = [...resolvedSources, ...digest.sources];
  return digest;
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
