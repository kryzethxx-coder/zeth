const { dataPaths } = require("../config");
const { readJson } = require("./jsonStore");

const defaultServerStatusConfig = {
  platformName: "Cfx.re",
  title: "Cfx.re Status",
  description: "All components are operational.",
  footerText: "Kryzeth </>",
  thumbnailUrl: "",
  imageUrl: "",
  statusPageUrl: "https://status.cfx.re/",
  apiStatus: {
    label: "Operational",
    status: "operational",
  },
  components: [
    { name: "CnL", status: "operational" },
    { name: "Forums", status: "operational" },
    { name: "Games", status: "operational" },
    { name: "FiveM", status: "operational" },
    { name: "Game Services", status: "operational" },
    { name: "Policy", status: "operational" },
    { name: "Server List Frontend", status: "operational" },
    { name: "RedM", status: "operational" },
    { name: "Web Services", status: "operational" },
    { name: "Keymaster", status: "operational" },
    { name: "\"Runtime\"", status: "operational" },
    { name: "Cfx.re Platform Server (FXServer)", status: "operational" },
    { name: "IDMS", status: "operational" },
  ],
  officialLinks: {
    website: "https://cfx.re/",
    forum: "https://forum.cfx.re/",
    portal: "https://portal.cfx.re/",
    fivem: "https://fivem.net/",
    docs: "https://docs.fivem.net/",
    keymaster: "https://keymaster.fivem.net/",
  },
  socials: {
    discord: {
      url: "",
      status: "operational",
    },
    youtube: {
      url: "",
      status: "operational",
    },
    tiktok: {
      url: "",
      status: "operational",
    },
    instagram: {
      url: "",
      status: "operational",
    },
    x: {
      url: "",
      status: "operational",
    },
  },
  lastUpdated: "2026-07-24 00:00:00",
};

function getServerStatusConfig() {
  return readJson(dataPaths.serverStatus, defaultServerStatusConfig);
}

module.exports = {
  defaultServerStatusConfig,
  getServerStatusConfig,
};
