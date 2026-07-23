async function handleSelectMenu(interaction, client) {
  const handler = client.selectMenus.find((menu) => menu.customId === interaction.customId);

  if (!handler) {
    await interaction.reply({
      content: "That dropdown is no longer active.",
      ephemeral: true,
    });
    return;
  }

  await handler.execute(interaction, client);
}

module.exports = handleSelectMenu;
