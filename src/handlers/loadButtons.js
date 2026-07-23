const fs = require("node:fs");
const path = require("node:path");

function loadButtons() {
  const buttonsPath = path.join(__dirname, "..", "buttons");
  const files = fs.readdirSync(buttonsPath).filter((file) => file.endsWith(".js"));

  return files.map((file) => require(path.join(buttonsPath, file)));
}

module.exports = loadButtons;
