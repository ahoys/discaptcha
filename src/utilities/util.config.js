const { lp } = require('logscribe').default('util.config', '\x1b[31m');
const path = require('path');
const fs = require('fs');

/**
 * Returns true if the given config-object is valid,
 * containing all the necessary values.
 * @param {object} configObj - Config-object.
 */
const isValidConfigObject = configObj => {
  try {
    return (
      typeof configObj === 'object' &&
      typeof configObj.clientOptions === 'object' &&
      typeof configObj.timeToVerifyInMs === 'number' &&
      typeof configObj.reconnectTime === 'number' &&
      typeof configObj.guilds === 'object' &&
      configObj.timeToVerifyInMs > 0 &&
      Object.keys(configObj.guilds).length > 0
    );
  } catch (e) {
    lp(e);
  }
};

/**
 * Returns a validated configuration object.
 * @param {string} dirPath - Path to a config-JSON file.
 */
const getConfig = (dirPath = './configs/config.json') => {
  try {
    const resolvedPath = path.resolve(dirPath);
    if (fs.existsSync(resolvedPath)) {
      const obj = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
      return isValidConfigObject(obj) ? obj : undefined;
    }
    return undefined;
  } catch (e) {
    lp(e);
  }
};

module.exports = { getConfig, isValidConfigObject };
