const { PermissionFlagsBits } = require("discord.js");
const { createBrandEmbed } = require("../utils/branding");
const logger = require("../utils/logger");
const { findTicketOwnerByChannel, getGuildTicketConfig, removeOpenTicket } = require("../utils/storage");
const { safeSendTicketLog, safeSendTranscriptLog } = require("../utils/ticketLogs");

module.exports = {
  customId: "ticket:delete",
  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: "This button can only be used inside a server.",
        ephemeral: true,
      });
      return;
    }

    const ticketConfig = getGuildTicketConfig(interaction.guildId);
    const ticketOwnerId = findTicketOwnerByChannel(interaction.guildId, interaction.channelId);
    const isSupportMember = ticketConfig?.supportRoleId
      ? interaction.member.roles.cache.has(ticketConfig.supportRoleId)
      : false;
    const canManageChannels = interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels);
    const isTicketOwner = ticketOwnerId === interaction.user.id;

    if (!ticketOwnerId) {
      await interaction.reply({
        content: "This channel is not tracked as an open ticket.",
        ephemeral: true,
      });
      return;
    }

    if (!isTicketOwner && !isSupportMember && !canManageChannels) {
      await interaction.reply({
        content: "Only the ticket owner or support team can delete this ticket.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferUpdate();
    const ticketName = interaction.channel.name;

    await safeSendTranscriptLog({
      guild: interaction.guild,
      ticketConfig,
      channel: interaction.channel,
      ownerId: ticketOwnerId,
      closedByTag: interaction.user.tag,
    });

    const deletedLogEmbed = createBrandEmbed({
      title: "Ticket Deleted",
      description: [
        `**Ticket:** #${ticketName}`,
        `**Owner:** <@${ticketOwnerId}>`,
        `**Deleted By:** ${interaction.user}`,
      ].join("\n"),
    });

    await safeSendTicketLog(interaction.guild, ticketConfig, deletedLogEmbed);
    removeOpenTicket(interaction.guildId, ticketOwnerId);
    logger.success("Ticket", `Deleted ticket ${ticketName} by ${interaction.user.tag}.`);
    await interaction.channel.delete(`Ticket deleted by ${interaction.user.tag}`);
  },
};
