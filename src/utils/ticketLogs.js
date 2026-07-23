const { AttachmentBuilder } = require("discord.js");
const { createBrandEmbed } = require("./branding");
const logger = require("./logger");

async function resolveLogChannel(guild, channelId, fallbackChannelId) {
  const targetId = channelId || fallbackChannelId;

  if (!targetId) {
    return null;
  }

  const channel = guild.channels.cache.get(targetId) || (await guild.channels.fetch(targetId).catch(() => null));
  return channel?.isTextBased() ? channel : null;
}

async function sendTicketLog(guild, ticketConfig, embed, files = []) {
  const logChannel = await resolveLogChannel(guild, ticketConfig?.logChannelId, ticketConfig?.panelChannelId);

  if (!logChannel) {
    return false;
  }

  await logChannel.send({
    embeds: [embed],
    files,
  });

  return true;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatContentAsHtml(content) {
  if (!content?.trim()) {
    return "";
  }

  return escapeHtml(content).replace(/\r?\n/g, "<br>");
}

function isImageAttachment(attachment) {
  return (
    attachment.contentType?.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(attachment.name || attachment.url || "")
  );
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function renderAttachmentHtml(attachment) {
  const safeName = escapeHtml(attachment.name || "attachment");
  const safeUrl = escapeHtml(attachment.url);

  if (isImageAttachment(attachment)) {
    return [
      '<div class="attachment attachment-image">',
      `  <a href="${safeUrl}" target="_blank" rel="noreferrer">${safeName}</a>`,
      `  <img src="${safeUrl}" alt="${safeName}">`,
      "</div>",
    ].join("");
  }

  return [
    '<div class="attachment attachment-file">',
    `  <a href="${safeUrl}" target="_blank" rel="noreferrer">${safeName}</a>`,
    "</div>",
  ].join("");
}

function renderEmbedHtml(embed) {
  const sections = [];

  if (embed.title) {
    sections.push(`<div class="embed-title">${escapeHtml(embed.title)}</div>`);
  }

  if (embed.description) {
    sections.push(`<div class="embed-description">${formatContentAsHtml(embed.description)}</div>`);
  }

  if (!sections.length) {
    return "";
  }

  return `<div class="message-embed">${sections.join("")}</div>`;
}

function renderMessageHtml(message) {
  const authorTag = message.author?.tag || "Unknown User";
  const displayName = message.member?.displayName || message.author?.globalName || message.author?.username || authorTag;
  const authorAvatar =
    message.author?.displayAvatarURL?.({ extension: "png", size: 128, forceStatic: true }) ||
    "https://cdn.discordapp.com/embed/avatars/0.png";
  const contentHtml = formatContentAsHtml(message.content);
  const attachmentsHtml = message.attachments.map(renderAttachmentHtml).join("");
  const embedsHtml = message.embeds.map(renderEmbedHtml).join("");
  const hasBody = Boolean(contentHtml || attachmentsHtml || embedsHtml);

  return [
    '<article class="message">',
    `  <img class="avatar" src="${escapeHtml(authorAvatar)}" alt="${escapeHtml(authorTag)}">`,
    '  <div class="message-body">',
    '    <div class="message-header">',
    `      <span class="display-name">${escapeHtml(displayName)}</span>`,
    `      <span class="author-tag">${escapeHtml(authorTag)}</span>`,
    `      <span class="timestamp">${escapeHtml(formatDate(message.createdAt))}</span>`,
    "    </div>",
    hasBody ? `    <div class="message-content">${contentHtml || '<span class="empty">[no text content]</span>'}</div>` : "",
    attachmentsHtml ? `    <div class="attachments">${attachmentsHtml}</div>` : "",
    embedsHtml ? `    <div class="embeds">${embedsHtml}</div>` : "",
    "  </div>",
    "</article>",
  ]
    .filter(Boolean)
    .join("\n");
}

async function buildTicketTranscript(channel) {
  const collected = [];
  let before;

  while (true) {
    const batch = await channel.messages.fetch({
      limit: 100,
      before,
    });

    if (!batch.size) {
      break;
    }

    collected.push(...batch.values());
    before = batch.last().id;

    if (batch.size < 100) {
      break;
    }
  }

  const orderedMessages = collected.sort((left, right) => left.createdTimestamp - right.createdTimestamp);
  const transcriptMessagesHtml = orderedMessages.length
    ? orderedMessages.map(renderMessageHtml).join("\n")
    : '<div class="empty-state">No messages were found in this ticket.</div>';
  const transcriptContent = [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    `  <title>${escapeHtml(`${channel.name} Transcript`)}</title>`,
    "  <style>",
    "    :root { color-scheme: dark; }",
    "    * { box-sizing: border-box; }",
    "    body { margin: 0; background: radial-gradient(circle at top, #32070c 0%, #160406 28%, #0b0b0d 100%); color: #f4f4f5; font-family: Arial, Helvetica, sans-serif; }",
    "    .page { max-width: 1100px; margin: 0 auto; padding: 32px 20px 48px; }",
    "    .header { background: linear-gradient(180deg, rgba(237,66,69,0.18), rgba(24,10,12,0.96)); border: 1px solid rgba(237,66,69,0.42); box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35); border-radius: 18px; padding: 24px; margin-bottom: 20px; }",
    "    .brand { display: inline-flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 999px; background: rgba(237,66,69,0.16); border: 1px solid rgba(237,66,69,0.35); color: #ff8b8d; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 14px; }",
    "    .header h1 { margin: 0 0 8px; font-size: 28px; color: #ffffff; }",
    "    .meta { color: #d2b7b8; font-size: 14px; line-height: 1.8; }",
    "    .meta strong { color: #ff9b9d; }",
    "    .messages { display: flex; flex-direction: column; gap: 14px; }",
    "    .message { display: flex; gap: 14px; background: rgba(20, 16, 18, 0.96); border: 1px solid rgba(237,66,69,0.18); border-left: 4px solid #ed4245; border-radius: 14px; padding: 16px; box-shadow: 0 10px 24px rgba(0, 0, 0, 0.24); }",
    "    .avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; background: #2b2f36; border: 2px solid rgba(237,66,69,0.45); }",
    "    .message-body { flex: 1; min-width: 0; }",
    "    .message-header { display: flex; gap: 10px; align-items: baseline; flex-wrap: wrap; margin-bottom: 8px; }",
    "    .display-name { font-weight: 700; color: #ffffff; }",
    "    .author-tag, .timestamp { color: #d19a9c; font-size: 13px; }",
    "    .message-content { white-space: normal; word-break: break-word; line-height: 1.6; color: #f3e7e7; }",
    "    .empty { color: #b7898b; font-style: italic; }",
    "    .attachments, .embeds { margin-top: 12px; display: flex; flex-direction: column; gap: 10px; }",
    "    .attachment, .message-embed { background: rgba(36, 18, 20, 0.92); border: 1px solid rgba(237,66,69,0.22); border-radius: 12px; padding: 12px; }",
    "    .attachment a, .attachment a:visited { color: #ff8b8d; text-decoration: none; font-weight: 600; }",
    "    .attachment a:hover { color: #ffb0b2; }",
    "    .attachment img { display: block; margin-top: 10px; max-width: 100%; border-radius: 10px; }",
    "    .embed-title { font-weight: 700; margin-bottom: 6px; color: #ff9698; }",
    "    .embed-description { color: #ecd9da; line-height: 1.6; }",
    "    .empty-state { background: rgba(20, 16, 18, 0.96); border: 1px dashed rgba(237,66,69,0.35); border-radius: 14px; padding: 24px; color: #d4b0b2; text-align: center; }",
    "  </style>",
    "</head>",
    "<body>",
    '  <div class="page">',
    '    <section class="header">',
    '      <div class="brand">Kryzeth </> Ticket Logs</div>',
    `      <h1>Ticket Transcript - #${escapeHtml(channel.name)}</h1>`,
    '      <div class="meta">',
    `        <div><strong>Guild:</strong> ${escapeHtml(channel.guild.name)} (${escapeHtml(channel.guild.id)})</div>`,
    `        <div><strong>Channel ID:</strong> ${escapeHtml(channel.id)}</div>`,
    `        <div><strong>Generated At:</strong> ${escapeHtml(new Date().toISOString())}</div>`,
    `        <div><strong>Messages:</strong> ${orderedMessages.length}</div>`,
    "      </div>",
    "    </section>",
    '    <section class="messages">',
    transcriptMessagesHtml,
    "    </section>",
    "  </div>",
    "</body>",
    "</html>",
  ].join("\n");

  return new AttachmentBuilder(Buffer.from(transcriptContent, "utf8"), {
    name: `${channel.name}-transcript.html`,
  });
}

async function sendTranscriptLog({
  guild,
  ticketConfig,
  channel,
  ownerId,
  closedByTag,
}) {
  const transcriptChannel = await resolveLogChannel(
    guild,
    ticketConfig?.transcriptChannelId,
    ticketConfig?.logChannelId || ticketConfig?.panelChannelId
  );

  if (!transcriptChannel) {
    return false;
  }

  const transcriptFile = await buildTicketTranscript(channel);
  const transcriptEmbed = createBrandEmbed({
    title: "Ticket Transcript",
    description: [
      `**Ticket Channel:** ${channel.name}`,
      `**Ticket Owner:** <@${ownerId}>`,
      `**Closed By:** ${closedByTag}`,
    ].join("\n"),
  });

  await transcriptChannel.send({
    embeds: [transcriptEmbed],
    files: [transcriptFile],
  });

  return true;
}

async function safeSendTicketLog(guild, ticketConfig, embed, files = []) {
  try {
    return await sendTicketLog(guild, ticketConfig, embed, files);
  } catch (error) {
    logger.error("TicketLog", "Failed to send ticket log message.", error);
    return false;
  }
}

async function safeSendTranscriptLog(options) {
  try {
    return await sendTranscriptLog(options);
  } catch (error) {
    logger.error("Transcript", "Failed to send ticket transcript.", error);
    return false;
  }
}

module.exports = {
  safeSendTicketLog,
  safeSendTranscriptLog,
};
