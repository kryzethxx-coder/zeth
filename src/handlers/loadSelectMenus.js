const fs = require("node:fs");
const path = require("node:path");

function loadSelectMenus() {
  const selectMenusPath = path.join(__dirname, "..", "selectMenus");
  const files = fs.readdirSync(selectMenusPath).filter((file) => file.endsWith(".js"));

  return files.map((file) => require(path.join(selectMenusPath, file)));
}

module.exports = loadSelectMenus;
