function formatTimestamp() {
  return new Date().toISOString().replace("T", " ").replace("Z", " UTC");
}

function stringifyDetail(detail) {
  if (detail instanceof Error) {
    return detail.stack || detail.message;
  }

  if (typeof detail === "string") {
    return detail;
  }

  try {
    return JSON.stringify(detail);
  } catch {
    return String(detail);
  }
}

function writeLog(level, emoji, scope, message, detail) {
  const prefix = `${emoji} [${formatTimestamp()}] [Kryzeth] [${scope}] ${message}`;

  if (level === "error") {
    console.error(detail ? `${prefix}\n${stringifyDetail(detail)}` : prefix);
    return;
  }

  if (level === "warn") {
    console.warn(detail ? `${prefix} | ${stringifyDetail(detail)}` : prefix);
    return;
  }

  console.log(detail ? `${prefix} | ${stringifyDetail(detail)}` : prefix);
}

function info(scope, message, detail) {
  writeLog("info", "ℹ️", scope, message, detail);
}

function success(scope, message, detail) {
  writeLog("info", "✅", scope, message, detail);
}

function warn(scope, message, detail) {
  writeLog("warn", "⚠️", scope, message, detail);
}

function error(scope, message, detail) {
  writeLog("error", "❌", scope, message, detail);
}

function event(scope, message, detail) {
  writeLog("info", "📌", scope, message, detail);
}

function action(scope, message, detail) {
  writeLog("info", "🚀", scope, message, detail);
}

module.exports = {
  action,
  error,
  event,
  info,
  success,
  warn,
};
