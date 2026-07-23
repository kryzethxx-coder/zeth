const { EmbedBuilder } = require("discord.js");
const { colors } = require("../config");
const { getAutoRoleConfig } = require("../utils/autoRoleConfig");
const logger = require("../utils/logger");
const { getWelcomeConfig } = require("../utils/storage");
const { createWelcomeAttachment } = require("../utils/welcomeImage");

function buildWelcomeDescription() {
  return [
    "•  Read the rules at **<#1529908287691030701>**",
    "•  Buy Products At **<#1529912273953493082>**",
  ].join("\n");
}

module.exports = {
  name: "guildMemberAdd",
  once: false,
  async execute(member) {
    logger.event("MemberJoin", `${member.user.tag} joined ${member.guild.name}.`);

    const autoRoleConfig = getAutoRoleConfig();

    if (autoRoleConfig.enabled && autoRoleConfig.roleIds.length) {
      for (const roleId of autoRoleConfig.roleIds) {
        try {
          if (!member.roles.cache.has(roleId)) {
            await member.roles.add(roleId, "Automatic role assignment for new members");
            logger.success("AutoRole", `Assigned role ${roleId} to ${member.user.tag}.`);
          }
        } catch (error) {
          logger.error("AutoRole", `Failed to assign autorole ${roleId} to ${member.user.tag}.`, error);
        }
      }
    }

    const welcomeConfig = getWelcomeConfig(member.guild.id);

    if (!welcomeConfig?.channelId) {
      return;
    }

    const channel =
      member.guild.channels.cache.get(welcomeConfig.channelId) ||
      (await member.guild.channels.fetch(welcomeConfig.channelId).catch(() => null));

    if (!channel?.isTextBased()) {
      return;
    }

    let welcomeImage = null;

    if (welcomeConfig.backgroundImage) {
      try {
        welcomeImage = await createWelcomeAttachment(member, welcomeConfig.backgroundImage);
      } catch (error) {
        logger.error("Welcome", `Failed to render the welcome image for ${member.user.tag}.`, error);
      }
    }

    const welcomeEmbed = new EmbedBuilder()
      .setColor(colors.danger)
      .setTitle(`Welcome **${member}** to **${member.guild.name}** !`)
      .setDescription(buildWelcomeDescription())
      .setFooter({ text: `You're ${member.guild.memberCount}th member` });

    if (welcomeImage) {
      welcomeEmbed.setImage(`attachment://welcome-${member.id}.png`);
    }

    await channel.send({
      embeds: [welcomeEmbed],
      files: welcomeImage ? [welcomeImage] : [],
    });
    logger.success("Welcome", `Sent welcome message for ${member.user.tag} in #${channel.name}.`);
  },
};
