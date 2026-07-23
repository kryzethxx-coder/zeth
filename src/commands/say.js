const { AttachmentBuilder, ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");
const { brandName, colors } = require("../config");
const { isValidHttpUrl, parseEmbedColor } = require("../utils/branding");

const attachmentOptionNames = ["attachment", "attachment-2", "attachment-3"];
const embedFieldOptions = [
  {
    nameKey: "field-1-name",
    valueKey: "field-1-value",
    inlineKey: "field-1-inline",
    label: "Field 1",
  },
  {
    nameKey: "field-2-name",
    valueKey: "field-2-value",
    inlineKey: "field-2-inline",
    label: "Field 2",
  },
];

function hasEmbedData(options) {
  return Boolean(
    options.title ||
    options.description ||
    options.authorName ||
    options.footer ||
    options.thumbnailUrl ||
    options.imageUrl ||
    options.embedUrl ||
    options.fields.length ||
    options.attachmentAsImage
  );
}

function collectAttachments(interaction) {
  return attachmentOptionNames
    .map((name) => interaction.options.getAttachment(name))
    .filter(Boolean);
}

function collectEmbedFields(interaction) {
  const fields = [];

  for (const option of embedFieldOptions) {
    const name = interaction.options.getString(option.nameKey);
    const value = interaction.options.getString(option.valueKey);
    const inline = interaction.options.getBoolean(option.inlineKey) || false;

    if (!name && !value) {
      continue;
    }

    if (!name || !value) {
      return {
        error: `${option.label} needs both \`${option.nameKey}\` and \`${option.valueKey}\`.`,
      };
    }

    fields.push({ name, value, inline });
  }

  return { fields };
}

function validateUrlOption(value, label) {
  if (!value) {
    return null;
  }

  if (isValidHttpUrl(value)) {
    return null;
  }

  return `${label} must start with \`http://\` or \`https://\`.`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Send a custom bot message or embed.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Where the bot should send the message.")
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Plain message content sent by the bot.")
        .setMaxLength(2000)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("embed-title")
        .setDescription("Embed title.")
        .setMaxLength(256)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("embed-description")
        .setDescription("Embed description.")
        .setMaxLength(4000)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("embed-author")
        .setDescription("Embed author text.")
        .setMaxLength(256)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("embed-url")
        .setDescription("Clickable URL for the embed title.")
        .setMaxLength(1000)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("Embed color in hex, for example #5865F2.")
        .setMaxLength(7)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("footer")
        .setDescription("Embed footer text.")
        .setMaxLength(2048)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("thumbnail-url")
        .setDescription("Embed thumbnail image URL.")
        .setMaxLength(1000)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("image-url")
        .setDescription("Embed main image URL.")
        .setMaxLength(1000)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("author-icon-url")
        .setDescription("Small icon shown next to the embed author.")
        .setMaxLength(1000)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("footer-icon-url")
        .setDescription("Small icon shown next to the footer text.")
        .setMaxLength(1000)
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("attachment")
        .setDescription("Optional file or image to attach to the message.")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("attachment-2")
        .setDescription("Second optional file or media attachment.")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("attachment-3")
        .setDescription("Third optional file or media attachment.")
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName("attachment-as-image")
        .setDescription("Use the first attached image as the embed image.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("field-1-name")
        .setDescription("First embed field title.")
        .setMaxLength(256)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("field-1-value")
        .setDescription("First embed field text.")
        .setMaxLength(1024)
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName("field-1-inline")
        .setDescription("Show the first field inline.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("field-2-name")
        .setDescription("Second embed field title.")
        .setMaxLength(256)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("field-2-value")
        .setDescription("Second embed field text.")
        .setMaxLength(1024)
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName("field-2-inline")
        .setDescription("Show the second field inline.")
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName("timestamp")
        .setDescription("Show the current time in the embed.")
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
    const message = interaction.options.getString("message");
    const title = interaction.options.getString("embed-title");
    const description = interaction.options.getString("embed-description");
    const authorName = interaction.options.getString("embed-author");
    const embedUrl = interaction.options.getString("embed-url");
    const colorInput = interaction.options.getString("color");
    const footer = interaction.options.getString("footer");
    const thumbnailUrl = interaction.options.getString("thumbnail-url");
    const imageUrl = interaction.options.getString("image-url");
    const authorIconUrl = interaction.options.getString("author-icon-url");
    const footerIconUrl = interaction.options.getString("footer-icon-url");
    const attachments = collectAttachments(interaction);
    const attachmentAsImage = interaction.options.getBoolean("attachment-as-image") || false;
    const withTimestamp = interaction.options.getBoolean("timestamp") || false;
    const fieldResult = collectEmbedFields(interaction);

    if (fieldResult.error) {
      await interaction.reply({
        content: fieldResult.error,
        ephemeral: true,
      });
      return;
    }

    const fields = fieldResult.fields;

    if (
      !message &&
      !hasEmbedData({
        title,
        description,
        authorName,
        footer,
        thumbnailUrl,
        imageUrl,
        embedUrl,
        fields,
        attachmentAsImage,
      }) &&
      !attachments.length
    ) {
      await interaction.reply({
        content: "Add message content, embed fields, or an attachment before using `/say`.",
        ephemeral: true,
      });
      return;
    }

    if (colorInput && parseEmbedColor(colorInput) === null) {
      await interaction.reply({
        content: "Embed color must be a valid 6-digit hex code like `#5865F2`.",
        ephemeral: true,
      });
      return;
    }

    const urlValidationError =
      validateUrlOption(thumbnailUrl, "Thumbnail URL") ||
      validateUrlOption(imageUrl, "Image URL") ||
      validateUrlOption(authorIconUrl, "Author icon URL") ||
      validateUrlOption(footerIconUrl, "Footer icon URL") ||
      validateUrlOption(embedUrl, "Embed URL");

    if (urlValidationError) {
      await interaction.reply({
        content: urlValidationError,
        ephemeral: true,
      });
      return;
    }

    if (authorIconUrl && !authorName) {
      await interaction.reply({
        content: "Add `embed-author` before using `author-icon-url`.",
        ephemeral: true,
      });
      return;
    }

    if (embedUrl && !title) {
      await interaction.reply({
        content: "Add `embed-title` before using `embed-url`.",
        ephemeral: true,
      });
      return;
    }

    if (!targetChannel?.isTextBased()) {
      await interaction.reply({
        content: "Choose a text channel for this command.",
        ephemeral: true,
      });
      return;
    }

    const imageAttachment = attachments.find((attachment) => attachment.contentType?.startsWith("image/"));

    if (attachmentAsImage && !imageAttachment) {
      await interaction.reply({
        content: "To use `attachment-as-image`, add at least one image attachment.",
        ephemeral: true,
      });
      return;
    }

    const payload = {};

    if (message) {
      payload.content = message;
    }

    if (attachments.length) {
      payload.files = attachments.map(
        (attachment) => new AttachmentBuilder(attachment.url, { name: attachment.name })
      );
    }

    if (
      hasEmbedData({
        title,
        description,
        authorName,
        footer,
        thumbnailUrl,
        imageUrl,
        embedUrl,
        fields,
        attachmentAsImage,
      })
    ) {
      const embed = new EmbedBuilder().setColor(parseEmbedColor(colorInput, colors.primary));

      if (title) {
        embed.setTitle(title);
      }

      if (embedUrl) {
        embed.setURL(embedUrl);
      }

      if (description) {
        embed.setDescription(description);
      }

      if (authorName) {
        embed.setAuthor({
          name: authorName,
          iconURL: authorIconUrl || undefined,
        });
      }

      embed.setFooter({
        text: footer || brandName,
        iconURL: footerIconUrl || undefined,
      });

      if (fields.length) {
        embed.addFields(fields);
      }

      if (thumbnailUrl) {
        embed.setThumbnail(thumbnailUrl);
      }

      if (attachmentAsImage) {
        embed.setImage(`attachment://${imageAttachment.name}`);
      } else if (imageUrl) {
        embed.setImage(imageUrl);
      }

      if (withTimestamp) {
        embed.setTimestamp();
      }

      payload.embeds = [embed];
    }

    await targetChannel.send(payload);

    await interaction.reply({
      content: `Message sent in ${targetChannel}.`,
      ephemeral: true,
    });
  },
};
