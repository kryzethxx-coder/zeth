const { EmbedBuilder } = require("discord.js");
const { brandName, colors } = require("../config");

function createBrandEmbed({ title, description, color = colors.primary, fields = [] }) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: brandName })
    .setTimestamp();

  if (fields.length) {
    embed.addFields(fields);
  }

  return embed;
}

function sanitizeChannelName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function parseEmbedColor(value, fallback = colors.primary) {
  if (!value) {
    return fallback;
  }

  const normalized = String(value).trim().replace(/^#/, "");

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return null;
  }

  return Number.parseInt(normalized, 16);
}

function isValidHttpUrl(value) {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

module.exports = {
  createBrandEmbed,
  isValidHttpUrl,
  parseEmbedColor,
  sanitizeChannelName,
};
