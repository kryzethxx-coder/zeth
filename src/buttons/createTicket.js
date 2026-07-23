const { createTicketChannel } = require("../utils/createTicketChannel");
const { getTicketPanelConfig } = require("../utils/ticketPanelConfig");

module.exports = {
  customId: "ticket:create",
  async execute(interaction) {
    const defaultTicketType = getTicketPanelConfig().types[0] || null;
    await createTicketChannel(interaction, defaultTicketType);
  },
};
