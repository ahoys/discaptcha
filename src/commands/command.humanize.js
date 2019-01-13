const log = require('debug')('command.humanize');
const config = require('../../configs/config.json');

/**
 * Marks everyone human by giving them the verification role.
 */
module.exports = (Client, Message, value = '') => {
  try {
    const { guild } = Message;
    const { id, roles, members } = guild;
    const roleId = config.guilds[id].verificationRoleId;
    const requestedRole = roles.find(r => String(r.id) === String(roleId));
    if (requestedRole) {
      const membersArr = members.array();
      const size = membersArr.length;
      let i = 0;
      const addRole = (member) => {
        member.addRole(requestedRole, 'Verified human.')
          .then(() => {
            i += 1;
            if (size > i) {
              addRole(membersArr[i]);
            } else {
              Message.reply(`Verified ${i} clients.`);
            }
          });
      };
      addRole(membersArr[i]);
    }
  } catch (e) {
    log(e);
  }
};
