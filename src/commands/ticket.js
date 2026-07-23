const {
  ActionRowBuilder,
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const { createBrandEmbed } = require("../utils/branding");
const { getTicketPanelConfig } = require("../utils/ticketPanelConfig");
const { getGuildTicketConfig, upsertGuildTicketConfig } = require("../utils/storage");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Manage the Kryzeth ticket system.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("panel")
        .setDescription("Create or update the ticket panel.")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The text channel where the ticket panel should be posted.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("support-role")
            .setDescription("The role that can view and manage tickets.")
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("category")
            .setDescription("The category where new ticket channels should be created.")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("log-channel")
            .setDescription("Optional channel for ticket action logs.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false)
        )
        .addChannelOption((option) =>
          option
            .setName("transcript-channel")
            .setDescription("Optional channel for ticket transcripts.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("logs")
        .setDescription("Set the ticket log and transcript channels.")
        .addChannelOption((option) =>
          option
            .setName("log-channel")
            .setDescription("Channel for ticket action logs.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("transcript-channel")
            .setDescription("Optional channel for ticket transcripts.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("transcript")
        .setDescription("Set the ticket transcript channel only.")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel for ticket transcripts.")
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

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "logs") {
      const existingConfig = getGuildTicketConfig(interaction.guildId) || {};
      const logChannel = interaction.options.getChannel("log-channel", true);
      const transcriptChannel = interaction.options.getChannel("transcript-channel");
      const nextTranscriptChannel = transcriptChannel || existingConfig.transcriptChannelId || logChannel;

      upsertGuildTicketConfig(interaction.guildId, {
        logChannelId: logChannel.id,
        transcriptChannelId:
          typeof nextTranscriptChannel === "string" ? nextTranscriptChannel : nextTranscriptChannel.id,
      });

      await interaction.reply({
        content: `Ticket log channel set to ${logChannel} and transcript channel set to ${typeof nextTranscriptChannel === "string" ? `<#${nextTranscriptChannel}>` : nextTranscriptChannel}.`,
        ephemeral: true,
      });
      return;
    }

    if (subcommand === "transcript") {
      const existingConfig = getGuildTicketConfig(interaction.guildId) || {};
      const transcriptChannel = interaction.options.getChannel("channel", true);

      upsertGuildTicketConfig(interaction.guildId, {
        logChannelId: existingConfig.logChannelId || existingConfig.panelChannelId || transcriptChannel.id,
        transcriptChannelId: transcriptChannel.id,
      });

      await interaction.reply({
        content: `Ticket transcript channel set to ${transcriptChannel}.`,
        ephemeral: true,
      });
      return;
    }

    const panelChannel = interaction.options.getChannel("channel", true);
    const supportRole = interaction.options.getRole("support-role", true);
    const category = interaction.options.getChannel("category", true);
    const logChannel = interaction.options.getChannel("log-channel");
    const transcriptChannel = interaction.options.getChannel("transcript-channel");
    const ticketPanelConfig = getTicketPanelConfig();

    const panelEmbed = createBrandEmbed({
      title: ticketPanelConfig.title,
      description: ticketPanelConfig.description,
      fields: [
        {
          name: "Ticket Types",
          value: ticketPanelConfig.types.map((type) => `${type.emoji ? `${type.emoji} ` : ""}${type.label}`).join("\n"),
          inline: false,
        },
      ],
    });

    const panelRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket:type")
        .setPlaceholder(ticketPanelConfig.placeholder)
        .addOptions(
          ticketPanelConfig.types.map((type) => ({
            label: type.label,
            description: type.description,
            value: type.value,
            emoji: type.emoji,
          }))
        )
    );

    const panelMessage = await panelChannel.send({
      embeds: [panelEmbed],
      components: [panelRow],
    });

    upsertGuildTicketConfig(interaction.guildId, {
      categoryId: category.id,
      logChannelId: logChannel?.id || panelChannel.id,
      panelChannelId: panelChannel.id,
      panelMessageId: panelMessage.id,
      supportRoleId: supportRole.id,
      transcriptChannelId: transcriptChannel?.id || logChannel?.id || panelChannel.id,
    });

    await interaction.reply({
      content: `Ticket panel posted in ${panelChannel} with support role ${supportRole}, category ${category}, log channel ${logChannel || panelChannel}, and transcript channel ${transcriptChannel || logChannel || panelChannel}.`,
      ephemeral: true,
    });
  },
};
