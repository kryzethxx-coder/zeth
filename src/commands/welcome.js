const { ChannelType, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");
const { setWelcomeChannel } = require("../utils/storage");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("welcome")
    .setDescription("Manage the Kryzeth welcome system.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("Set the welcome channel.")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel where welcome embeds should be sent.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: "This command can only be used inside a server.",
        ephemeral: true,
      });
      return;
    }

    const channel = interaction.options.getChannel("channel", true);
    setWelcomeChannel(interaction.guildId, channel.id);

    await interaction.reply({
      content: `Welcome messages will now be sent in ${channel}.`,
      ephemeral: true,
    });
  },
};
