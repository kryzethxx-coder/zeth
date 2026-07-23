const handleButton = require("../handlers/handleButton");
const handleCommand = require("../handlers/handleCommand");
const handleSelectMenu = require("../handlers/handleSelectMenu");

module.exports = {
  name: "interactionCreate",
  once: false,
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      try {
        await handleCommand(interaction, client);
      } catch (error) {
        console.error(`[Kryzeth] Command error for /${interaction.commandName}:`, error);

        if (interaction.deferred || interaction.replied) {
          await interaction.followUp({
            content: "Something went wrong while running that command.",
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: "Something went wrong while running that command.",
            ephemeral: true,
          });
        }
      }

      return;
    }

    if (interaction.isButton()) {
      try {
        await handleButton(interaction, client);
      } catch (error) {
        console.error(`[Kryzeth] Button error for ${interaction.customId}:`, error);

        if (interaction.deferred || interaction.replied) {
          await interaction.followUp({
            content: "Something went wrong while handling that button.",
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: "Something went wrong while handling that button.",
            ephemeral: true,
          });
        }
      }

      return;
    }

    if (!interaction.isStringSelectMenu()) {
      return;
    }

    try {
      await handleSelectMenu(interaction, client);
    } catch (error) {
      console.error(`[Kryzeth] Select menu error for ${interaction.customId}:`, error);

      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({
          content: "Something went wrong while handling that selection.",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "Something went wrong while handling that selection.",
          ephemeral: true,
        });
      }
    }
  },
};
