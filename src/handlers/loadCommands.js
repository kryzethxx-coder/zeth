const fs = require("node:fs");
const path = require("node:path");
const { Collection } = require("discord.js");
const logger = require("../utils/logger");

function loadCommands() {
  const commands = new Collection();
  const commandsPath = path.join(__dirname, "..", "commands");
  const files = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

  for (const file of files) {
    const command = require(path.join(commandsPath, file));
    commands.set(command.data.name, command);
  }

  logger.success("Loader", `Loaded ${commands.size} command(s).`);
  return commands;
}

module.exports = loadCommands;
