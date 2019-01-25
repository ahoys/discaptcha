const { lp } = require('logscribe').default('command.roles', '\x1b[32m');

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
