const { Client, GatewayIntentBits } = require("discord.js");
const { clientId, token } = require("./config");
const loadButtons = require("./handlers/loadButtons");
const loadCommands = require("./handlers/loadCommands");
const loadEvents = require("./handlers/loadEvents");
const loadSelectMenus = require("./handlers/loadSelectMenus");
const registerApplicationCommands = require("./handlers/registerCommands");
const logger = require("./utils/logger");

if (!token || !clientId) {
  logger.error("Startup", "Missing DISCORD_TOKEN or CLIENT_ID in the environment.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.commands = loadCommands();
client.buttons = loadButtons();
client.selectMenus = loadSelectMenus();
client.registerApplicationCommands = () => registerApplicationCommands(client);

loadEvents(client);
logger.action("Startup", "Connecting to Discord...");

client.login(token).catch((error) => {
  logger.error("Startup", "Failed to start the bot.", error);
  process.exit(1);
});
