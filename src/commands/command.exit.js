const log = require('debug')('command.exit');

/**
 * Exists Discord and closes the bot.
 */
module.exports = (Client, Message, value = '') => {
  try {
    Message.reply('Goodbye 😿!').then(() => {
      Client.destroy().then(() => {
        process.exit(2);
      });
    });
  } catch (e) {
    log(e);
  }
};
