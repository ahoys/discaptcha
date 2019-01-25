const guildUtil = require('../utilities/util.guild');
const { lp } = require('logscribe').default('command.botify', '\x1b[32m');

/**
 * Removes the verification role from everyone.
 */
module.exports = (Client, Message, value = '') => {
  try {
    const Role = guildUtil.getVerificationRoleOfGuild(Message.guild);
    if (Role) {
      guildUtil
        .getGuildMembersWithOrWithoutRole(Message.guild, true, Role)
        .then(GuildMembers => {
          guildUtil
            .adjustRoleOfMembers(
              false,
              Role,
              GuildMembers,
              `Botify triggered by ${Message.author.username}.`
            )
            .then(count => {
              Message.reply(
                `Success! ${count} client(s) declared to be unverified.`
              );
            })
            .catch(e => {
              Message.reply('Botify failed.');
              lp('Execution failed.', e);
            });
        });
    }
  } catch (e) {
    lp(e);
  }
};
