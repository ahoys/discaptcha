const log = require('debug')('command.kick');
const guildUtil = require('../utilities/util.guild');
const config = require('../../configs/config.json');

/**
 * Kicks unverified clients.
 */
module.exports = (Client, Message, value = '') => {
  try {
    if (Message && Message.guild && Message.author) {
      const Guild = Message.guild;
      const verificationRoleId = config.guilds[Guild.id].verificationRoleId;
      const requestedRole = Guild.roles.find(
        r => String(r.id) === String(verificationRoleId)
      );
      if (requestedRole) {
        const missing = Guild.members.filter(
          m => m.roles.find(r => r.id === requestedRole.id) === null
        );
        if (missing && missing.size) {
          missing.forEach(GuildMember => {
            guildUtil.kickGuildMember(
              GuildMember,
              `Kicking unverified clients. Triggered by ${User.username}.`
            );
          });
          Message.reply('Kicking unverified client(s)...');
        }
      }
    }
  } catch (e) {
    log(e);
  }
};
