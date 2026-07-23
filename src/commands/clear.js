const { PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Delete a number of recent messages from this channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("How many recent messages to delete (1-100).")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: "This command can only be used inside a server.",
        ephemeral: true,
      });
      return;
    }

    const amount = interaction.options.getInteger("amount", true);
    const channel = interaction.channel;

    if (!channel?.isTextBased() || typeof channel.bulkDelete !== "function") {
      await interaction.reply({
        content: "This channel does not support bulk message deletion.",
        ephemeral: true,
      });
      return;
    }

    const botPermissions = channel.permissionsFor(interaction.guild.members.me);

    if (!botPermissions?.has(PermissionFlagsBits.ManageMessages)) {
      await interaction.reply({
        content: "I need the `Manage Messages` permission in this channel to use `/clear`.",
        ephemeral: true,
      });
      return;
    }

    const deletedMessages = await channel.bulkDelete(amount, true);

    if (!deletedMessages.size) {
      await interaction.reply({
        content: "No recent messages could be deleted. Messages older than 14 days cannot be bulk deleted.",
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      content:
        deletedMessages.size === amount
          ? `Deleted ${deletedMessages.size} message(s) from ${channel}.`
          : `Deleted ${deletedMessages.size} message(s) from ${channel}. Older messages were skipped.`,
      ephemeral: true,
    });
  },
};
