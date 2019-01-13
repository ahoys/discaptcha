const guildUtil = require('../utilities/util.guild');
const log = require('debug')('command.humanize');

/**
 * Marks everyone human by giving them the verification role.
 */
module.exports = (Client, Message, value = '') => {
  try {
    const verifiedRole = guildUtil.getVerificationRoleOfGuild(Message.guild);
    if (verifiedRole) {
      Message.guild
        .fetchMembers()
        .then((Guild) => {
          guildUtil
            .adjustRoleOfMembers(
              true,
              verifiedRole,
              Guild.members,
              `Humanize triggered by ${Message.author.username}`,
            )
              .then((count) => {
                Message.reply(`Success! ${count} client(s) declared human!`);
              })
              .catch((e) => {
                Message.reply('Humanize failed.');
                log('Execution failed.', e);
              });
        });
    }
  } catch (e) {
    log(e);
  }
};
