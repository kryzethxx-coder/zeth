const fs = require("node:fs");
const path = require("node:path");
const logger = require("../utils/logger");

function loadSelectMenus() {
  const selectMenusPath = path.join(__dirname, "..", "selectMenus");
  const files = fs.readdirSync(selectMenusPath).filter((file) => file.endsWith(".js"));
  const selectMenus = files.map((file) => require(path.join(selectMenusPath, file)));
  logger.success("Loader", `Loaded ${selectMenus.length} select menu handler(s).`);
  return selectMenus;
}

module.exports = loadSelectMenus;
