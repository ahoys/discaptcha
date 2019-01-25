const { logscribe } = require('logscribe');
const { lp } = logscribe('command.reboot', '\x1b[32m');

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
    lp(e);
  }
};
