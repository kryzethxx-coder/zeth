const { dataPaths } = require("../config");
const { readJson } = require("./jsonStore");

const defaultAutoRoleConfig = {
  enabled: true,
  roleIds: ["1529909758302224436"],
};

function getAutoRoleConfig() {
  const config = readJson(dataPaths.autoRole, defaultAutoRoleConfig);

  return {
    enabled: config.enabled !== false,
    roleIds: Array.isArray(config.roleIds)
      ? config.roleIds.map((roleId) => String(roleId).trim()).filter(Boolean)
      : defaultAutoRoleConfig.roleIds,
  };
}

module.exports = {
  defaultAutoRoleConfig,
  getAutoRoleConfig,
};
