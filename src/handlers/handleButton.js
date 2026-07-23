const logger = require("../utils/logger");

async function handleButton(interaction, client) {
  const handler = client.buttons.find((button) => button.customId === interaction.customId);

  if (!handler) {
    logger.warn("Button", `Tried to use inactive button ${interaction.customId}.`);
    await interaction.reply({
      content: "That button is no longer active.",
      ephemeral: true,
    });
    return;
  }

  logger.action("Button", `${interaction.user.tag} clicked ${interaction.customId}.`);
  await handler.execute(interaction, client);
  logger.success("Button", `Handled ${interaction.customId} for ${interaction.user.tag}.`);
}

module.exports = handleButton;
