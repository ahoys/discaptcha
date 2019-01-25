const { lp } = require('logscribe').default('command.help', '\x1b[32m');
const auth = require('../../configs/auth.json');
const config = require('../../package.json');

/**
 * Prints out all the available commands.
 */
module.exports = (Client, Message, value = '') => {
  try {
    // We don't want to display bot owner commands.
    let msg = `\n${config.description}\nAuthor: ${config.author}\nVersion: ${
      config.version
    }\n`;
    const commands = require('./index.js');
    const isBotOwner = auth.owner === Message.author.id;
    const keys = isBotOwner
      ? Object.keys(commands)
      : Object.keys(commands).filter(
          key =>
            commands[key].permissions.owner ||
            commands[key].permissions.moderator
        );
    keys.forEach((key, i) => {
      const { description, permissions } = commands[key];
      const ownerPermission = !permissions.owner
        ? '\n(Only the bot owner can use this command.)'
        : '';
      const modPermission =
        !permissions.moderator && permissions.owner
          ? '\n(Moderators cannot use this command.)'
          : '';
      if (i === 0) {
        msg += `\n\`${key}\`\n${description}${ownerPermission}${modPermission}`;
      } else {
        msg += `\n\n\`${key}\`\n${description}${ownerPermission}${modPermission}`;
      }
    });
    Message.reply(msg);
  } catch (e) {
    lp(e);
  }
};
