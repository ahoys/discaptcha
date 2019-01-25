const guildUtil = require('../utilities/util.guild');
const { lp } = require('logscribe').default('command.humanize', '\x1b[32m');

/**
 * Marks everyone human by giving them the verification role.
 */
module.exports = (Client, Message, value = '') => {
  try {
    const Role = guildUtil.getVerificationRoleOfGuild(Message.guild);
    if (Role) {
      guildUtil
        .getGuildMembersWithOrWithoutRole(Message.guild, false, Role)
        .then(GuildMembers => {
          guildUtil
            .adjustRoleOfMembers(
              true,
              Role,
              GuildMembers,
              `Humanize triggered by ${Message.author.username}.`
            )
            .then(count => {
              Message.reply(`Success! ${count} client(s) declared human!`);
            })
            .catch(e => {
              Message.reply('Humanize failed.');
              lp('Execution failed.', e);
            });
        });
    }
  } catch (e) {
    lp(e);
  }
};
