const path = require("node:path");
require("dotenv").config();

function normalizeSnowflake(value) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!/^\d{17,20}$/.test(trimmed)) {
    return null;
  }

  return trimmed;
}

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: normalizeSnowflake(process.env.CLIENT_ID),
  devGuildId: normalizeSnowflake(process.env.DEV_GUILD_ID),
  brandName: "Kryzeth </>",
  colors: {
    primary: 0x5865f2,
    success: 0x57f287,
    danger: 0xed4245,
    neutral: 0x2b2d31,
  },
  dataPaths: {
    ticketPanel: path.join(__dirname, "..", "data", "ticket-panel.json"),
    tickets: path.join(__dirname, "..", "data", "tickets.json"),
    welcome: path.join(__dirname, "..", "data", "welcome.json"),
  },
};
