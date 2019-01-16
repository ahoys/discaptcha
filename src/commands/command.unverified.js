const guildUtil = require('../utilities/util.guild');
const log = require('debug')('command.unverified');

/**
 * Lists all clients that do not have the verification role.
 */
module.exports = (Client, Message, value = '') => {
  try {
    const Role = guildUtil.getVerificationRoleOfGuild(Message.guild);
    if (Role) {
      guildUtil
        .getGuildMembersWithOrWithoutRole(Message.guild, false, Role)
        .then(GuildMembers => {
          const size = GuildMembers.size;
          if (size < 1) {
            // No unverified.
            Message.reply(`Everyone got the "${Role.name}" -role.`);
          } else if (size === 1) {
            // One unverified.
            Message.reply(
              `Only ${GuildMembers.array().map(m => m.user.username)} ` +
                'is unverified.'
            );
          } else if (size <= 10) {
            // Ten or less unverified.
            Message.reply(
              `The following ${size} clients are unverified:` +
                `${GuildMembers.array().map(m => ' ' + m.user.username)}.`
            );
          } else {
            // Over ten unverified.
            Message.reply(
              `There are ${size} clients without the "${Role.name}" -role.`
            );
          }
        })
        .catch(e => {
          log(e);
          Message.reply('execution failed.');
        });
    }
  } catch (e) {
    log(e);
  }
};
