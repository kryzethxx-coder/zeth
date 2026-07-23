const { dataPaths } = require("../config");
const { readJson } = require("./jsonStore");

const defaultTicketPanelConfig = {
  title: "Kryzeth Ticket Center",
  description: "Choose a ticket type from the dropdown below to open a private support ticket.",
  placeholder: "Select a ticket type...",
  types: [
    {
      value: "support",
      label: "Support Ticket",
      description: "If you need any help",
      emoji: "🛟",
      channelPrefix: "support",
    },
  ],
};

function sanitizeValue(value, fallback) {
  const normalized = String(value || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || fallback;
}

function sanitizeType(type, index) {
  const fallbackValue = `ticket-${index + 1}`;

  return {
    value: sanitizeValue(type?.value, fallbackValue).slice(0, 100),
    label: String(type?.label || `Ticket Type ${index + 1}`).slice(0, 100),
    description: String(type?.description || "Open a private ticket.").slice(0, 100),
    emoji: type?.emoji ? String(type.emoji).slice(0, 20) : undefined,
    channelPrefix: sanitizeValue(type?.channelPrefix, type?.value || "ticket").slice(0, 30),
  };
}

function getTicketPanelConfig() {
  const rawConfig = readJson(dataPaths.ticketPanel, defaultTicketPanelConfig);
  const safeTypes = Array.isArray(rawConfig.types) && rawConfig.types.length
    ? rawConfig.types.slice(0, 25).map(sanitizeType)
    : defaultTicketPanelConfig.types.map(sanitizeType);

  return {
    title: String(rawConfig.title || defaultTicketPanelConfig.title).slice(0, 256),
    description: String(rawConfig.description || defaultTicketPanelConfig.description).slice(0, 4000),
    placeholder: String(rawConfig.placeholder || defaultTicketPanelConfig.placeholder).slice(0, 150),
    types: safeTypes,
  };
}

module.exports = {
  getTicketPanelConfig,
};
