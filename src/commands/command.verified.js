const guildUtil = require('../utilities/util.guild');
const log = require('debug')('command.verified');

/**
 * Lists all clients that have the verification role.
 */
module.exports = (Client, Message, value = '') => {
  try {
    const Role = guildUtil.getVerificationRoleOfGuild(Message.guild);
    if (Role) {
      guildUtil
        .getGuildMembersWithOrWithoutRole(Message.guild, true, Role)
        .then(GuildMembers => {
          const size = GuildMembers.size;
          Message.reply(
            `There are ${size} client(s) with the ${Role.name} -role.`
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
