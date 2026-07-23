const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const { createBrandEmbed, sanitizeChannelName } = require("./branding");
const {
  getGuildTicketConfig,
  getOpenTicketChannelId,
  removeOpenTicket,
  setOpenTicket,
} = require("./storage");

async function createTicketChannel(interaction, ticketType = null) {
  if (!interaction.inGuild()) {
    await interaction.reply({
      content: "Tickets can only be created inside a server.",
      ephemeral: true,
    });
    return;
  }

  const ticketConfig = getGuildTicketConfig(interaction.guildId);

  if (!ticketConfig?.supportRoleId || !ticketConfig?.categoryId) {
    await interaction.reply({
      content: "The ticket system is not configured yet. Run `/ticket panel` first.",
      ephemeral: true,
    });
    return;
  }

  const existingChannelId = getOpenTicketChannelId(interaction.guildId, interaction.user.id);

  if (existingChannelId) {
    const existingChannel =
      interaction.guild.channels.cache.get(existingChannelId) ||
      (await interaction.guild.channels.fetch(existingChannelId).catch(() => null));

    if (existingChannel) {
      await interaction.reply({
        content: `You already have an open ticket: ${existingChannel}`,
        ephemeral: true,
      });
      return;
    }

    removeOpenTicket(interaction.guildId, interaction.user.id);
  }

  await interaction.deferReply({ ephemeral: true });

  const channelPrefix = sanitizeChannelName(ticketType?.channelPrefix || ticketType?.value || "ticket");
  const userName = sanitizeChannelName(interaction.user.username || interaction.user.id) || interaction.user.id;
  const channelName = `${channelPrefix}-${userName}`.slice(0, 90);
  const ticketLabel = ticketType?.label || "Support Ticket";
  const ticketDescription = ticketType?.description || "A private support ticket has been opened.";

  const ticketChannel = await interaction.guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: ticketConfig.categoryId,
    topic: `${ticketLabel} for ${interaction.user.tag} (${interaction.user.id})`,
    permissionOverwrites: [
      {
        id: interaction.guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.EmbedLinks,
        ],
      },
      {
        id: ticketConfig.supportRoleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageMessages,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.EmbedLinks,
        ],
      },
      {
        id: interaction.client.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.ManageMessages,
        ],
      },
    ],
  });

  setOpenTicket(interaction.guildId, interaction.user.id, ticketChannel.id);

  const controls = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket:close")
      .setLabel("Close Ticket")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("ticket:delete")
      .setLabel("Delete Ticket")
      .setStyle(ButtonStyle.Secondary)
  );

  const ticketEmbed = createBrandEmbed({
    title: ticketLabel,
    description: `${interaction.user}, your ticket has been created.\n\n${ticketDescription}\n\n${interaction.guild.roles.cache.get(ticketConfig.supportRoleId) || `<@&${ticketConfig.supportRoleId}>`} will respond here shortly.`,
  });

  await ticketChannel.send({
    content: `${interaction.user} <@&${ticketConfig.supportRoleId}>`,
    embeds: [ticketEmbed],
    components: [controls],
  });

  await interaction.editReply({
    content: `Your ticket has been created: ${ticketChannel}`,
  });
}

module.exports = {
  createTicketChannel,
};
