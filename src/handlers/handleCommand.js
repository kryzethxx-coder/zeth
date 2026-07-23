const logger = require("../utils/logger");

async function handleCommand(interaction, client) {
  const command = client.commands.get(interaction.commandName);

  if (!command) {
    logger.warn("Command", `Tried to run unavailable command /${interaction.commandName}.`);
    await interaction.reply({
      content: "That command is not available right now.",
      ephemeral: true,
    });
    return;
  }

  logger.action(
    "Command",
    `${interaction.user.tag} ran /${interaction.commandName} in ${interaction.guild?.name || "DMs"}.`
  );
  await command.execute(interaction, client);
  logger.success("Command", `Completed /${interaction.commandName} for ${interaction.user.tag}.`);
}

module.exports = handleCommand;
