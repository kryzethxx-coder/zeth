const { REST, Routes } = require("discord.js");
const { clientId, devGuildId, token } = require("../config");

async function registerApplicationCommands(client) {
  if (!clientId || !token) {
    console.warn("[Kryzeth] Skipping command registration because CLIENT_ID or DISCORD_TOKEN is missing.");
    return;
  }

  const payload = [...client.commands.values()].map((command) => command.data.toJSON());
  const rest = new REST({ version: "10" }).setToken(token);

  if (devGuildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, devGuildId), {
      body: payload,
    });
    console.log(`[Kryzeth] Registered ${payload.length} guild command(s) to ${devGuildId}.`);
    return;
  }

  await rest.put(Routes.applicationCommands(clientId), {
    body: payload,
  });
  console.log(`[Kryzeth] Registered ${payload.length} global command(s).`);
}

module.exports = registerApplicationCommands;
