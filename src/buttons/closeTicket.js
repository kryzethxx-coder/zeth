const { PermissionFlagsBits } = require("discord.js");
const { colors } = require("../config");
const { createBrandEmbed } = require("../utils/branding");
const { findTicketOwnerByChannel, getGuildTicketConfig } = require("../utils/storage");

module.exports = {
  customId: "ticket:close",
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
        content: "Only the ticket owner or support team can close this ticket.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferUpdate();

    await interaction.channel.permissionOverwrites.edit(ticketOwnerId, {
      SendMessages: false,
      AddReactions: false,
    });

    if (!interaction.channel.name.startsWith("closed-")) {
      await interaction.channel.setName(`closed-${interaction.channel.name}`.slice(0, 100));
    }

    const closedEmbed = createBrandEmbed({
      title: "Ticket Closed",
      description: "This ticket has been closed. A support member can delete it when everything is wrapped up.",
      color: colors.danger,
    });

    await interaction.channel.send({
      embeds: [closedEmbed],
    });
  },
};
