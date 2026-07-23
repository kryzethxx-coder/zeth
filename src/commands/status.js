const { ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");
const { colors } = require("../config");
const { isValidHttpUrl } = require("../utils/branding");
const { getServerStatusConfig } = require("../utils/serverStatusConfig");

function getStatusIcon(status) {
  const normalized = String(status || "").trim().toLowerCase();

  if (normalized === "operational" || normalized === "online" || normalized === "healthy") {
    return "🟢";
  }

  if (normalized === "degraded" || normalized === "warning" || normalized === "partial") {
    return "🟡";
  }

  if (normalized === "outage" || normalized === "offline" || normalized === "down") {
    return "🔴";
  }

  return "⚪";
}

function formatComponentStatus(component) {
  return `${getStatusIcon(component.status)} ${component.name}: ${component.status || "unknown"}`;
}

function formatSocialStatus(name, social) {
  const socialConfig =
    social && typeof social === "object"
      ? social
      : {
          status: "operational",
          url: typeof social === "string" ? social : "",
        };

  const label = socialConfig.url && isValidHttpUrl(socialConfig.url) ? `[${name}](${socialConfig.url})` : name;
  return `${getStatusIcon(socialConfig.status)} ${label}: ${socialConfig.status || "unknown"}`;
}

function formatApiStatus(apiStatus) {
  const label = apiStatus?.label || "Unknown";
  return `${getStatusIcon(apiStatus?.status)} ${label}`;
}

function buildSocialStatusLines(socials) {
  const socialPlatforms = [
    ["Discord", socials?.discord],
    ["YouTube", socials?.youtube],
    ["TikTok", socials?.tiktok],
    ["Instagram", socials?.instagram],
    ["X", socials?.x],
  ];

  return socialPlatforms.map(([name, config]) => formatSocialStatus(name, config));
}

function buildStatusDescription(config) {
  const lines = [];

  if (config.description) {
    lines.push(config.description.trim(), "");
  }

  lines.push("**API Status**");
  lines.push(formatApiStatus(config.apiStatus));
  lines.push("");
  lines.push("**Component Status**");

  const componentLines = (config.components || []).map(formatComponentStatus);
  lines.push(...(componentLines.length ? componentLines : ["No components configured."]));
  lines.push("");
  lines.push("**Social Media Status**");
  lines.push(...buildSocialStatusLines(config.socials));

  return lines.join("\n").trim();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Post the branded Cfx.re status embed.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Where the status embed should be posted.")
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(false)
    ),
  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: "This command can only be used inside a server.",
        ephemeral: true,
      });
      return;
    }

    const targetChannel = interaction.options.getChannel("channel") || interaction.channel;

    if (!targetChannel?.isTextBased()) {
      await interaction.reply({
        content: "Choose a text channel for this command.",
        ephemeral: true,
      });
      return;
    }

    const config = getServerStatusConfig();
    const statusEmbed = new EmbedBuilder()
      .setColor(colors.success)
      .setTitle(config.title || `${config.platformName || "Cfx.re"} Status`)
      .setDescription(buildStatusDescription(config));

    if (isValidHttpUrl(config.statusPageUrl)) {
      statusEmbed.setURL(config.statusPageUrl);
    }

    if (config.footerText) {
      const footerText = config.lastUpdated
        ? `${config.footerText} | Last Updated: ${config.lastUpdated}`
        : config.footerText;
      statusEmbed.setFooter({ text: footerText });
    }

    if (isValidHttpUrl(config.thumbnailUrl)) {
      statusEmbed.setThumbnail(config.thumbnailUrl);
    }

    if (isValidHttpUrl(config.imageUrl)) {
      statusEmbed.setImage(config.imageUrl);
    }

    await targetChannel.send({
      embeds: [statusEmbed],
    });

    await interaction.reply({
      content: `Cfx.re status embed sent in ${targetChannel}.`,
      ephemeral: true,
    });
  },
};
