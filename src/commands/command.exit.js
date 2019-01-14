const log = require('debug')('command.exit');

/**
 * Exists Discord and closes the bot.
 */
module.exports = (Client, Message, value = '') => {
  try {
    Message.reply('Goodbye 😿!').then(() => {
      Client.destroy().then(() => {
        log('Goodbye!');
        process.exit(0);
      });
    });
  } catch (e) {
    log(e);
  }
};
