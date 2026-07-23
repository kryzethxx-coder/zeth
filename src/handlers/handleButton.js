async function handleButton(interaction, client) {
  const handler = client.buttons.find((button) => button.customId === interaction.customId);

  if (!handler) {
    await interaction.reply({
      content: "That button is no longer active.",
      ephemeral: true,
    });
    return;
  }

  await handler.execute(interaction, client);
}

module.exports = handleButton;
