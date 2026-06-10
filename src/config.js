import fs from "node:fs";
import path from "node:path";

export const CONFIG_FILE = "eduorchestrate.config.json";
export const LOCAL_ENV_FILE = ".env.local";

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function writeJson(filePath, payload) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

export function loadConfig(rootDir = process.cwd()) {
  const configPath = path.join(rootDir, CONFIG_FILE);
  const config = readJson(configPath);
  if (!config) {
    throw new Error(`No ${CONFIG_FILE} found. Run npx eduorchestrate first.`);
  }
  return config;
}

export function saveConfig(config, rootDir = process.cwd()) {
  writeJson(path.join(rootDir, CONFIG_FILE), config);
}

export function appendGitignore(entries, rootDir = process.cwd()) {
  const gitignorePath = path.join(rootDir, ".gitignore");
  const existing = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, "utf8") : "";
  const lines = new Set(existing.split(/\r?\n/).filter(Boolean));
  let changed = false;
  for (const entry of entries) {
    if (!lines.has(entry)) {
      lines.add(entry);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(gitignorePath, `${Array.from(lines).join("\n")}\n`, "utf8");
  }
}

export function writeLocalEnv(values, rootDir = process.cwd()) {
  const lines = Object.entries(values)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${String(value).replace(/\n/g, "\\n")}`);
  fs.writeFileSync(path.join(rootDir, LOCAL_ENV_FILE), `${lines.join("\n")}\n`, "utf8");
}

export function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const [key, ...rest] = line.split("=");
    env[key.trim()] = rest.join("=").trim();
  }
  return env;
}

export function resolveDataDir(config, rootDir = process.cwd()) {
  return path.join(rootDir, config.dataDir || "data");
}
