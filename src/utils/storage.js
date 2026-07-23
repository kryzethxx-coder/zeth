const { dataPaths } = require("../config");
const { readJson, writeJson } = require("./jsonStore");

function getTicketState() {
  return readJson(dataPaths.tickets, { guilds: {} });
}

function saveTicketState(state) {
  writeJson(dataPaths.tickets, state);
}

function getGuildTicketConfig(guildId) {
  const state = getTicketState();
  return state.guilds[guildId] || null;
}

function upsertGuildTicketConfig(guildId, config) {
  const state = getTicketState();
  const existing = state.guilds[guildId] || { openTickets: {} };

  state.guilds[guildId] = {
    ...existing,
    ...config,
    openTickets: existing.openTickets || {},
  };

  saveTicketState(state);
  return state.guilds[guildId];
}

function getOpenTicketChannelId(guildId, userId) {
  const state = getTicketState();
  return state.guilds[guildId]?.openTickets?.[userId] || null;
}

function setOpenTicket(guildId, userId, channelId) {
  const state = getTicketState();
  const existing = state.guilds[guildId] || {};

  state.guilds[guildId] = {
    ...existing,
    openTickets: {
      ...(existing.openTickets || {}),
      [userId]: channelId,
    },
  };

  saveTicketState(state);
}

function removeOpenTicket(guildId, userId) {
  const state = getTicketState();
  const guildData = state.guilds[guildId];

  if (!guildData?.openTickets?.[userId]) {
    return;
  }

  delete guildData.openTickets[userId];
  saveTicketState(state);
}

function findTicketOwnerByChannel(guildId, channelId) {
  const state = getTicketState();
  const openTickets = state.guilds[guildId]?.openTickets || {};

  return (
    Object.entries(openTickets).find(([, storedChannelId]) => storedChannelId === channelId)?.[0] ||
    null
  );
}

function getWelcomeState() {
  return readJson(dataPaths.welcome, { guilds: {} });
}

function saveWelcomeState(state) {
  writeJson(dataPaths.welcome, state);
}

function setWelcomeConfig(guildId, config) {
  const state = getWelcomeState();
  const existing = state.guilds[guildId] || {};
  state.guilds[guildId] = {
    ...existing,
    ...config,
  };
  saveWelcomeState(state);
  return state.guilds[guildId];
}

function getWelcomeConfig(guildId) {
  const state = getWelcomeState();
  return state.guilds[guildId] || null;
}

module.exports = {
  findTicketOwnerByChannel,
  getGuildTicketConfig,
  getOpenTicketChannelId,
  getWelcomeConfig,
  removeOpenTicket,
  setOpenTicket,
  setWelcomeConfig,
  upsertGuildTicketConfig,
};
