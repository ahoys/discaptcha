const log = require('debug')('command.botify');
const config = require('../../configs/config.json');

/**
 * Removes the verification role from everyone.
 */
module.exports = (Client, Message, value = '') => {
  try {
    if (
      Message &&
      Message.guild &&
      Message.guild.id &&
      Message.guild.roles &&
      Message.guild.members
    ) {
      const guildId = Message.guild.id;
      const guildRoles = Message.guild.roles;
      const verifiedRoleId = config.guilds[guildId].verificationRoleId;
      const verifiedRole = guildRoles
        .find(r => String(r.id) === String(verifiedRoleId));
      if (verifiedRole) {
        const guildMembers = Message.guild.members;
        const membersArr = guildMembers.array();
        const size = membersArr.length;
        let i = 0;
        const removeRole = (GuildMember) => {
          GuildMember.removeRole(verifiedRole, 'Botify command.')
            .then(() => {
              i += 1;
              if (size > i) {
                removeRole(membersArr[i]);
              } else {
                Message.reply(`Removed the role from ${i} clients.`);
              }
            });
        };
        removeRole(membersArr[i]);
      }
    }
  } catch (e) {
    log(e);
  }
};
