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
          Message.reply(
            `There are ${size} client(s) without the ${Role.name} -role.`
          );
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
