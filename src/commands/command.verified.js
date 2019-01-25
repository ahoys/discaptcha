const guildUtil = require('../utilities/util.guild');
const { lp } = require('logscribe').default('command.verified', '\x1b[32m');

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
          if (size < 1) {
            // No verified.
            Message.reply(
              'There are no verified clients. ' +
                `Use \`humanize\` to verify the current server members. ` +
                `Humanize will give the role "${Role.name}" ` +
                'to every member of this server, including those ' +
                'who are offline.'
            );
          } else if (size === 1) {
            // One verified.
            Message.reply(
              `Only ${GuildMembers.array().map(m => m.user.username)} ` +
                'is verified.'
            );
          } else if (size <= 10) {
            // Ten or less verified.
            Message.reply(
              `The following ${size} clients are verified:` +
                `${GuildMembers.array().map(m => ' ' + m.user.username)}.`
            );
          } else {
            // Over ten verified.
            Message.reply(
              `There are ${size} clients with the "${Role.name}" -role.`
            );
          }
        })
        .catch(e => {
          lp(e);
          Message.reply('execution failed.');
        });
    } else {
      Message.reply(
        'The verified role is not set. ',
        `Use command \`role\` to set the role. See \`help\` for more info.`
      );
    }
  } catch (e) {
    lp(e);
  }
};
