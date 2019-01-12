const log = require('debug')('command.unverified');
const config = require('../../configs/config.json');

/**
 * Lists all clients that do not have the verification role.
 */
module.exports = (Client, Message) => {
  try {
    const { guild } = Message;
    const { guilds } = config;
    if (
      guilds &&
      guilds[guild.id] &&
      guilds[guild.id].verificationRoleId
    ) {
      const roleId = guilds[guild.id].verificationRoleId;
      const requestedRole = guild.roles.find(r => String(r.id) === String(roleId));
      if (requestedRole) {
        const missing = guild.members.filter(m => {
          const result = m.roles.find(r => r.id === requestedRole.id);
          return result === null;
        });
        if (missing && missing.size) {
          let i = 0;
          let msg = '';
          missing.forEach((member) => {
            if (i === 0) {
              msg += `${member.user.username}`;
            } else {
              msg += `, ${member.user.username}`;
            }
            i += 1;
          });
          Message.reply(`The following members do not have the role: ${msg}.`);
          Message.reply('Maybe you should try the command "humanize"?');
        } else {
          Message.reply('Everyone got the role.');
        }
      } else {
        Message.reply('The verification role was not found. Does it exist?');
      }
    } else {
      Message.reply('The verification role is missing from the config.');
    }
  } catch (e) {
    log(e);
  }
};
