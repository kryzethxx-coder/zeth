const { colors } = require("../config");
const { createBrandEmbed } = require("../utils/branding");
const { getWelcomeConfig } = require("../utils/storage");

module.exports = {
  name: "guildMemberAdd",
  once: false,
  async execute(member) {
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

    const welcomeEmbed = createBrandEmbed({
      title: `Welcome to ${member.guild.name}`,
      description: `Please welcome ${member} to the server. We're glad to have you here.`,
      color: colors.success,
    });

    await channel.send({
      content: `${member}`,
      embeds: [welcomeEmbed],
    });
  },
};
