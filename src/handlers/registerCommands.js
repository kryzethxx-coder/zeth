const { REST, Routes } = require("discord.js");
const { clientId, devGuildId, token } = require("../config");
const logger = require("../utils/logger");

async function registerApplicationCommands(client) {
  if (!clientId || !token) {
    logger.warn("Commands", "Skipping command registration because CLIENT_ID or DISCORD_TOKEN is missing.");
    return;
  }

  const payload = [...client.commands.values()].map((command) => command.data.toJSON());
  const rest = new REST({ version: "10" }).setToken(token);

  if (devGuildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, devGuildId), {
      body: payload,
    });
    logger.success("Commands", `Registered ${payload.length} guild command(s) to ${devGuildId}.`);
    return;
  }

  await rest.put(Routes.applicationCommands(clientId), {
    body: payload,
  });
  logger.success("Commands", `Registered ${payload.length} global command(s).`);
}

module.exports = registerApplicationCommands;
