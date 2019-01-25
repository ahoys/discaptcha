const { logscribe } = require('logscribe');
const { lp } = logscribe('command.roles');

/**
 * Prints a list of available guild roles.
 */
module.exports = (Client, Message, value = '') => {
  try {
    const { guild } = Message;
    const { roles } = guild;
    let msg = '\n';
    roles.forEach(role => {
      msg += `\`${role.name}\`: ${role.id}\n`;
    });
    msg = msg.replace(/\@/g, '');
    Message.reply(msg);
  } catch (e) {
    lp(e);
  }
};
