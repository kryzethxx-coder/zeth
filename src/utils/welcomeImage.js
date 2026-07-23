const fs = require("node:fs");
const path = require("node:path");
const { AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { dataPaths } = require("../config");

function ensureWelcomeAssetDirectory() {
  fs.mkdirSync(dataPaths.welcomeAssets, { recursive: true });
}

function getFileExtension(attachment) {
  const fromName = path.extname(attachment.name || "").toLowerCase();

  if (fromName) {
    return fromName;
  }

  const contentType = attachment.contentType || "";

  if (contentType === "image/png") {
    return ".png";
  }

  if (contentType === "image/jpeg") {
    return ".jpg";
  }

  if (contentType === "image/webp") {
    return ".webp";
  }

  return ".png";
}

async function saveWelcomeBackground(guildId, attachment) {
  ensureWelcomeAssetDirectory();

  const extension = getFileExtension(attachment);
  const fileName = `${guildId}${extension}`;
  const filePath = path.join(dataPaths.welcomeAssets, fileName);
  const response = await fetch(attachment.url);

  if (!response.ok) {
    throw new Error(`Failed to download welcome background (${response.status}).`);
  }

  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

  for (const existingFile of fs.readdirSync(dataPaths.welcomeAssets)) {
    const existingPath = path.join(dataPaths.welcomeAssets, existingFile);

    if (existingFile !== fileName && existingFile.startsWith(`${guildId}.`)) {
      fs.unlinkSync(existingPath);
    }
  }

  return fileName;
}

function fitText(ctx, text, maxWidth, startSize, minSize) {
  let fontSize = startSize;

  while (fontSize > minSize) {
    ctx.font = `700 ${fontSize}px Sans`;

    if (ctx.measureText(text).width <= maxWidth) {
      return fontSize;
    }

    fontSize -= 4;
  }

  return minSize;
}

async function createWelcomeAttachment(member, backgroundFileName) {
  const backgroundPath = path.join(dataPaths.welcomeAssets, backgroundFileName);

  if (!fs.existsSync(backgroundPath)) {
    return null;
  }

  const background = await loadImage(backgroundPath);
  const avatar = await loadImage(member.displayAvatarURL({ extension: "png", size: 512, forceStatic: true }));
  const canvas = createCanvas(background.width, background.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(background, 0, 0, background.width, background.height);

  // Tuned from the actual rendered result so the avatar fully fills the left placeholder.
  const avatarSize = Math.round(background.width * 0.265);
  const avatarX = Math.round(background.width * 0.048);
  const avatarY = Math.round(background.height * 0.13);
  const avatarRadius = avatarSize / 2;
  const avatarCenterX = avatarX + avatarRadius;
  const nameY = avatarY + avatarSize + Math.round(background.height * 0.035);
  const nameMaxWidth = Math.round(background.width * 0.26);
  const nameFontSize = fitText(ctx, member.displayName, nameMaxWidth, 72, 34);

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarCenterX, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
  ctx.restore();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.font = `700 ${nameFontSize}px Sans`;
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = Math.max(6, Math.round(nameFontSize * 0.16));
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = 10;
  ctx.strokeText(member.displayName, avatarCenterX, nameY, nameMaxWidth);
  ctx.fillText(member.displayName, avatarCenterX, nameY, nameMaxWidth);

  return new AttachmentBuilder(await canvas.encode("png"), {
    name: `welcome-${member.id}.png`,
  });
}

module.exports = {
  createWelcomeAttachment,
  saveWelcomeBackground,
};
