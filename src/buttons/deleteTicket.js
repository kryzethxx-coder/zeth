const { PermissionFlagsBits } = require("discord.js");
const { findTicketOwnerByChannel, getGuildTicketConfig, removeOpenTicket } = require("../utils/storage");

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
    removeOpenTicket(interaction.guildId, ticketOwnerId);
    await interaction.channel.delete(`Ticket deleted by ${interaction.user.tag}`);
  },
};
