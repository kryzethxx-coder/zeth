module.exports = {
  name: "clientReady",
  once: true,
  async execute(client) {
    try {
      await client.registerApplicationCommands();
    } catch (error) {
      console.error("[Kryzeth] Failed to register application commands:", error);
    }

    console.log(`[Kryzeth] Logged in as ${client.user.tag}.`);
  },
};
