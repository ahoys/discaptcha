const { logscribe } = require('logscribe');
const { lp } = logscribe('command.exit', '\x1b[32m');

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
    lp(e);
  }
};
