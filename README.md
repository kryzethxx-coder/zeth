# Kryzeth </> Discord Bot

Professional Discord bot template built with Node.js 22 and `discord.js` v14.

## Features

- Ticket panel with `/ticket panel`
- Dropdown ticket type selection
- Private ticket channels with one open ticket per user
- Close and delete ticket controls
- Configurable support role and ticket category
- Editable ticket panel options in JSON
- Custom announcement command with `/say`
- Welcome system with `/welcome set`
- Embedded welcome messages with member mention
- JSON-backed configuration storage
- Modular slash command, event, and button handlers
- Automatic slash command registration on startup
- `.env`-based configuration

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your values:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_client_id_here
DEV_GUILD_ID=optional_guild_id_for_instant_command_updates
```

If you do not want guild-only testing, delete the `DEV_GUILD_ID` line entirely instead of leaving the placeholder text.

3. Start the bot:

```bash
npm start
```

## Commands

- `/ticket panel channel:#support-panels support-role:@Support category:Tickets`
- `/say channel:#announcements message:Hello embed-title:Update embed-description:Patch notes color:#5865F2`
- `/welcome set channel:#welcome`

## Notes

- If `DEV_GUILD_ID` is set, commands register to that server for instant updates.
- If `DEV_GUILD_ID` is omitted, commands register globally.
- Ticket and welcome data are stored in `data/tickets.json` and `data/welcome.json`.
- Edit the dropdown title, description, placeholder, emojis, and ticket types in `data/ticket-panel.json`.
- `/say` supports plain text, custom embeds, image URLs, thumbnails, attachments, and using an attached image as the embed image.
