const fs = require("node:fs");
const path = require("node:path");
const logger = require("../utils/logger");

function loadButtons() {
  const buttonsPath = path.join(__dirname, "..", "buttons");
  const files = fs.readdirSync(buttonsPath).filter((file) => file.endsWith(".js"));
  const buttons = files.map((file) => require(path.join(buttonsPath, file)));
  logger.success("Loader", `Loaded ${buttons.length} button handler(s).`);
  return buttons;
}

module.exports = loadButtons;
