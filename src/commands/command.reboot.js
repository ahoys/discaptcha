const log = require('debug')('command.reboot');

/**
 * Reboots the bot.
 */
module.exports = (Client, Message, value = '') => {
  try {
    Message.reply(`Rebooting. I'll be back!`).then(() => {
      Client.destroy().then(() => {
        process.exit(3);
      });
    });
  } catch (e) {
    log(e);
  }
};
