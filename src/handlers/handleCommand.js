async function handleCommand(interaction, client) {
  const command = client.commands.get(interaction.commandName);

  if (!command) {
    await interaction.reply({
      content: "That command is not available right now.",
      ephemeral: true,
    });
    return;
  }

  await command.execute(interaction, client);
}

module.exports = handleCommand;
