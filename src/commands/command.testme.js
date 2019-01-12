const log = require('debug')('command.testme');
const verifyUtil = require('../utilities/util.verify');

/**
 * Tests the verification.
 */
module.exports = (Client, Message) => {
  try {
    // The last arg should be false. We don't want to actually
    // kick the tester.
    verifyUtil.verifyClient(Message.member, false);
  } catch (e) {
    log(e);
  }
};
