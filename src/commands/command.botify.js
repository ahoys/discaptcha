const guildUtil = require('../utilities/util.guild');
const log = require('debug')('command.botify');

/**
 * Removes the verification role from everyone.
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
              false,
              verifiedRole,
              Guild.members,
              `Botify triggered by ${Message.author.username}`,
            )
              .then((count) => {
                Message.reply(`Success! ${count} client(s) declared to be unverified.`);
              })
              .catch((e) => {
                Message.reply('Botify failed.');
                log('Execution failed.', e);
              });
        })
    }
  } catch (e) {
    log(e);
  }
};
