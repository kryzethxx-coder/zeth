const logger = require("../utils/logger");

module.exports = {
  name: "clientReady",
  once: true,
  async execute(client) {
    try {
      await client.registerApplicationCommands();
    } catch (error) {
      logger.error("Ready", "Failed to register application commands.", error);
    }

    logger.success("Ready", `Logged in as ${client.user.tag}.`);
  },
};
