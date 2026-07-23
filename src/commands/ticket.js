const {
  ActionRowBuilder,
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const { createBrandEmbed } = require("../utils/branding");
const { getTicketPanelConfig } = require("../utils/ticketPanelConfig");
const { upsertGuildTicketConfig } = require("../utils/storage");

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
    ),
  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: "This command can only be used inside a server.",
        ephemeral: true,
      });
      return;
    }

    const panelChannel = interaction.options.getChannel("channel", true);
    const supportRole = interaction.options.getRole("support-role", true);
    const category = interaction.options.getChannel("category", true);
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
      panelChannelId: panelChannel.id,
      panelMessageId: panelMessage.id,
      supportRoleId: supportRole.id,
    });

    await interaction.reply({
      content: `Ticket panel posted in ${panelChannel} with support role ${supportRole} and category ${category}.`,
      ephemeral: true,
    });
  },
};
