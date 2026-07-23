const { createTicketChannel } = require("../utils/createTicketChannel");
const { getTicketPanelConfig } = require("../utils/ticketPanelConfig");

module.exports = {
  customId: "ticket:type",
  async execute(interaction) {
    const selectedValue = interaction.values[0];
    const ticketType = getTicketPanelConfig().types.find((type) => type.value === selectedValue);

    if (!ticketType) {
      await interaction.reply({
        content: "That ticket type is no longer available. Please try again.",
        ephemeral: true,
      });
      return;
    }

    await createTicketChannel(interaction, ticketType);
  },
};
