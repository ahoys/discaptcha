const log = require('debug')('command.kick');
const auth = require('../../configs/auth.json');
const config = require('../../configs/config.json');

/**
 * Kicks unverified clients.
 */
module.exports = (Client, Message, value = '') => {
  try {
    if (
      Message &&
      Message.guild &&
      Message.author
    ) {
      const Guild = Message.guild;
      const verificationRoleId = config.guilds[Guild.id].verificationRoleId;
      const requestedRole = Guild.roles
        .find(r => String(r.id) === String(verificationRoleId));
      if (requestedRole) {
        const missing = Guild.members
          .filter(m => m.roles.find(r => r.id === requestedRole.id) === null);
        if (missing && missing.size) {
          let i = 0;
          missing.forEach((GuildMember) => {
            if (
              GuildMember.kickable &&
              GuildMember.id !== Client.id &&
              GuildMember.id !== auth.owner
            ) {
              const User = Message.author;
              GuildMember.kick(`Kick command triggered by ${User.username}.`);
              i += 1;
            }
          });
          Message.reply(`Kicked ${i} unverified client(s).`);
        }
      }
    }
  } catch (e) {
    log(e);
  }
};
