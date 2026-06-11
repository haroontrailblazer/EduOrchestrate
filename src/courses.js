import fs from "node:fs";
import path from "node:path";
import { inferRoleKey } from "./research.js";
import { resolveDataDir, writeJson } from "./config.js";

const COMMON_SOURCES = [
  source("Anthropic Claude Code docs", "https://docs.anthropic.com/en/docs/claude-code/overview", "Official Claude Code learning path for agentic coding workflows.", ["agentic-ai", "full-stack"]),
  source("IBM SkillsBuild", "https://skillsbuild.org/", "Free IBM learning catalog for AI, cybersecurity, data, and career skills.", ["agentic-ai", "cybersecurity", "data-science", "full-stack"]),
  source("Microsoft Learn", "https://learn.microsoft.com/training/", "Official Microsoft role-based modules for Azure, AI, security, data, and developer roles.", ["agentic-ai", "cybersecurity", "data-science", "full-stack"]),
  source("Google Cloud Skills Boost", "https://www.cloudskillsboost.google/", "Google Cloud labs and learning paths for generative AI, data, security, and cloud apps.", ["agentic-ai", "cybersecurity", "data-science", "full-stack"]),
  source("AWS Skill Builder", "https://skillbuilder.aws/", "AWS digital training for cloud, AI/ML, security, and app development.", ["agentic-ai", "cybersecurity", "data-science", "full-stack"]),
  source("GitHub Skills", "https://skills.github.com/", "Free GitHub hands-on courses for Git, Actions, Codespaces, and collaboration.", ["agentic-ai", "full-stack", "data-science"]),
  source("NVIDIA Deep Learning Institute", "https://www.nvidia.com/en-us/training/", "NVIDIA training catalog for accelerated AI, LLMs, data science, and robotics.", ["agentic-ai", "data-science"]),
  source("Cisco Networking Academy", "https://www.netacad.com/", "Cisco networking, cybersecurity, and infrastructure courses.", ["cybersecurity", "full-stack"]),
  source("Salesforce Trailhead", "https://trailhead.salesforce.com/", "Free Salesforce and enterprise app development trails.", ["full-stack", "data-science"]),
  source("Databricks Academy", "https://www.databricks.com/learn/training/home", "Lakehouse, data engineering, analytics, and ML training.", ["data-science"]),
  source("Snowflake University", "https://learn.snowflake.com/", "Snowflake learning paths for data cloud, analytics, and engineering.", ["data-science"]),
  source("Red Hat Developer Learning", "https://developers.redhat.com/learn", "Developer learning for Linux, containers, Kubernetes, and cloud-native apps.", ["full-stack", "cybersecurity"])
];

const ROLE_SOURCE_HINTS = {
  "agentic-ai": {
    priorityQueries: [
      "Claude Code 101 Anthropic official",
      "agentic AI course official free",
      "LLM evaluation course official",
      "RAG course official free"
    ],
    newsletters: [
      newsletter("Anthropic News", "https://www.anthropic.com/news", "Claude, Claude Code, model, and safety updates."),
      newsletter("Hugging Face Blog", "https://huggingface.co/blog", "Open-source model, dataset, and tooling updates."),
      newsletter("The Batch", "https://www.deeplearning.ai/the-batch/", "AI research and industry updates."),
      newsletter("Import AI", "https://importai.substack.com/", "AI policy, research, and industry tracking."),
      newsletter("Latent Space", "https://www.latent.space/", "Developer-focused AI engineering updates.")
    ]
  },
  "full-stack": {
    priorityQueries: [
      "full stack developer official free course Microsoft Learn",
      "GitHub Actions official course",
      "web app development official free course",
      "cloud developer free training official"
    ],
    newsletters: [
      newsletter("GitHub Changelog", "https://github.blog/changelog/", "GitHub platform and developer workflow updates."),
      newsletter("JavaScript Weekly", "https://javascriptweekly.com/", "JavaScript ecosystem updates."),
      newsletter("TLDR Web Dev", "https://tldr.tech/webdev", "Concise frontend and backend development news."),
      newsletter("web.dev Blog", "https://web.dev/blog", "Official web platform guidance.")
    ]
  },
  cybersecurity: {
    priorityQueries: [
      "cybersecurity analyst official free course IBM SkillsBuild",
      "SOC analyst official free training",
      "SIEM training official free",
      "cloud security official free training"
    ],
    newsletters: [
      newsletter("CISA Cybersecurity Advisories", "https://www.cisa.gov/news-events/cybersecurity-advisories", "Current vulnerability and threat advisories."),
      newsletter("OWASP News", "https://owasp.org/news/", "Application security updates."),
      newsletter("Microsoft Security Blog", "https://www.microsoft.com/security/blog/", "Threat intelligence and defender updates."),
      newsletter("AWS Security Blog", "https://aws.amazon.com/blogs/security/", "Cloud security updates.")
    ]
  },
  "data-science": {
    priorityQueries: [
      "data scientist official free course IBM SkillsBuild",
      "machine learning official free training Google",
      "Databricks Academy machine learning free",
      "Snowflake data science training official"
    ],
    newsletters: [
      newsletter("Kaggle Blog", "https://www.kaggle.com/blog", "Datasets, competitions, notebooks, and applied ML updates."),
      newsletter("Google Cloud Blog Data Analytics", "https://cloud.google.com/blog/products/data-analytics", "Data analytics and ML platform updates."),
      newsletter("Databricks Blog", "https://www.databricks.com/blog", "Lakehouse, ML, and data engineering updates."),
      newsletter("The Batch", "https://www.deeplearning.ai/the-batch/", "ML and AI research updates.")
    ]
  }
};

export function createCoursePack(config, plan) {
  const roleKey = plan?.roleKey || inferRoleKey(config.learner.targetRole);
  const hints = ROLE_SOURCE_HINTS[roleKey] || ROLE_SOURCE_HINTS["agentic-ai"];
  const roleSources = COMMON_SOURCES.filter((entry) => entry.roles.includes(roleKey));
  const searchLinks = hints.priorityQueries.map((query) => ({
    title: query,
    url: `https://www.google.com/search?q=${encodeURIComponent(`${query} ${config.learner.targetRole}`)}`,
    rule: "Use as a discovery link. Verify current enrollment, cost, and source owner before recommending."
  }));
  return {
    generatedAt: new Date().toISOString(),
    targetRole: config.learner.targetRole,
    roleKey,
    primarySkill: plan?.primarySkill || config.learner.focusSkill || "not specified",
    rule: "Prefer official company learning catalogs and free/MNC offerings. Do not recommend Coursera or Udemy unless the user asks for marketplaces.",
    sourcePolicy: [
      "Verify current availability before telling the learner a course is open or free.",
      "Prefer official vendor catalogs, docs, academies, and newsletters.",
      "Use search links for discovery, then cite the official source actually selected.",
      "Keep daily email recommendations to 2 courses and 2 newsletters unless the user asks for more."
    ],
    recommendedSources: roleSources,
    discoverySearches: searchLinks,
    newsletters: hints.newsletters
  };
}

export function saveCoursePack(config, coursePack) {
  const dataDir = resolveDataDir(config);
  const jsonPath = path.join(dataDir, "learning-sources.json");
  const markdownPath = path.join(dataDir, "learning-sources.md");
  writeJson(jsonPath, coursePack);
  writeMarkdown(markdownPath, renderCoursePackMarkdown(coursePack));
  return {
    jsonPath: path.relative(process.cwd(), jsonPath),
    markdownPath: path.relative(process.cwd(), markdownPath)
  };
}

function renderCoursePackMarkdown(pack) {
  return [
    `# Learning Sources for ${pack.targetRole}`,
    "",
    `Primary skill: ${pack.primarySkill}`,
    "",
    "## Rules",
    ...pack.sourcePolicy.map((item) => `- ${item}`),
    "",
    "## Official Course Sources",
    ...pack.recommendedSources.map((item) => `- ${item.title}: ${item.url} - ${item.reason}`),
    "",
    "## Discovery Searches",
    ...pack.discoverySearches.map((item) => `- ${item.title}: ${item.url}`),
    "",
    "## Newsletters and Update Feeds",
    ...pack.newsletters.map((item) => `- ${item.title}: ${item.url} - ${item.reason}`)
  ].join("\n");
}

function writeMarkdown(filePath, text) {
  fs.writeFileSync(filePath, `${text}\n`, "utf8");
}

function source(title, url, reason, roles) {
  return { title, url, reason, roles, costHint: "official catalog; verify current free/paid status before recommending" };
}

function newsletter(title, url, reason) {
  return { title, url, reason };
}
