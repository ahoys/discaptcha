const config = require('../../configs/config.json');
const { lp } = require('logscribe').default('command.moderators', '\x1b[32m');

/**
 * Prints moderator role information.
 */
module.exports = (Client, Message, value = '') => {
  try {
    if (
      Message &&
      Message.guild &&
      Message.guild.roles &&
      Message.guild.id &&
      Message.guild.members
    ) {
      const Guild = Message.guild;
      const moderatorRole = Guild.roles.find(
        r => String(r.id) === String(config.guilds[Guild.id].moderatorRoleId)
      );
      if (moderatorRole) {
        const moderators = Message.guild.members.filter(
          m => m.roles.find(r => r.id === moderatorRole.id) !== null
        );
        if (moderators && moderators.size) {
          Message.reply(
            'The current moderator role is ' +
              `"${moderatorRole.name}", id: ${moderatorRole.id}.\n\n` +
              `There are ${moderators.size} moderators.`
          );
        } else {
          Message.reply('No moderators set.');
        }
      } else {
        Message.reply('Moderator role is not set.');
      }
    }
  } catch (e) {
    lp(e);
  }
};
