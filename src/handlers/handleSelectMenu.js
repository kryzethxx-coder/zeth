const logger = require("../utils/logger");

async function handleSelectMenu(interaction, client) {
  const handler = client.selectMenus.find((menu) => menu.customId === interaction.customId);

  if (!handler) {
    logger.warn("SelectMenu", `Tried to use inactive select menu ${interaction.customId}.`);
    await interaction.reply({
      content: "That dropdown is no longer active.",
      ephemeral: true,
    });
    return;
  }

  logger.action("SelectMenu", `${interaction.user.tag} used ${interaction.customId}.`);
  await handler.execute(interaction, client);
  logger.success("SelectMenu", `Handled ${interaction.customId} for ${interaction.user.tag}.`);
}

module.exports = handleSelectMenu;
