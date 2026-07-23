const fs = require("node:fs");
const path = require("node:path");

function cloneDefault(defaultValue) {
  return JSON.parse(JSON.stringify(defaultValue));
}

function ensureJsonFile(filePath, defaultValue) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
  }
}

function readJson(filePath, defaultValue = {}) {
  const fallback = cloneDefault(defaultValue);
  ensureJsonFile(filePath, fallback);

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return raw.trim() ? JSON.parse(raw) : fallback;
  } catch (error) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

function writeJson(filePath, value) {
  ensureJsonFile(filePath, value);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

module.exports = {
  readJson,
  writeJson,
};
