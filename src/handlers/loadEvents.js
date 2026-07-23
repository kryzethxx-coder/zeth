const fs = require("node:fs");
const path = require("node:path");
const logger = require("../utils/logger");

function loadEvents(client) {
  const eventsPath = path.join(__dirname, "..", "events");
  const files = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"));

  for (const file of files) {
    const event = require(path.join(eventsPath, file));

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }

  logger.success("Loader", `Loaded ${files.length} event handler(s).`);
}

module.exports = loadEvents;
