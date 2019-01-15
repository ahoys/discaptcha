const path = require('path');
const fs = require('fs');

/**
 * Returns true if the given auth-object is valid,
 * containing all the necessary values.
 * @param {object} authObj - Auth-object.
 */
const isValidAuthObject = authObj => {
  return (
    typeof authObj === 'object' &&
    typeof authObj.id === 'string' &&
    typeof authObj.token === 'string' &&
    typeof authObj.owner === 'string' &&
    authObj.id.trim() !== '' &&
    authObj.token.trim() !== '' &&
    authObj.owner.trim() !== ''
  );
};

/**
 * Returns a validated authentication object.
 * @param {string} dirPath - Path to a auth-JSON file.
 */
const getAuth = (dirPath = './configs/auth.json') => {
  const resolvedPath = path.resolve(dirPath);
  if (fs.existsSync(resolvedPath)) {
    const obj = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    return isValidAuthObject(obj) ? obj : undefined;
  }
  return undefined;
};

module.exports = { getAuth, isValidAuthObject };
