const { ChannelType, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");
const { setWelcomeConfig } = require("../utils/storage");
const { saveWelcomeBackground } = require("../utils/welcomeImage");

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
        .addAttachmentOption((option) =>
          option
            .setName("background")
            .setDescription("Optional welcome background image template.")
            .setRequired(false)
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
    const background = interaction.options.getAttachment("background");
    const nextConfig = { channelId: channel.id };

    if (background) {
      if (!background.contentType?.startsWith("image/")) {
        await interaction.reply({
          content: "The welcome background must be an image attachment.",
          ephemeral: true,
        });
        return;
      }

      nextConfig.backgroundImage = await saveWelcomeBackground(interaction.guildId, background);
    }

    setWelcomeConfig(interaction.guildId, nextConfig);

    await interaction.reply({
      content: background
        ? `Welcome messages will now be sent in ${channel}, and the new welcome image template has been saved.`
        : `Welcome messages will now be sent in ${channel}.`,
      ephemeral: true,
    });
  },
};
