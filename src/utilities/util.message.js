const log = require('debug')('util.message');

/**
 * Maps a message into a commanding frame.
 * This simplifies reading commands from messages.
 * @returns {object}
 */
const readCommand = Message => {
  try {
    const splits = Message.content.split(' ', 3);
    return {
      mention: splits[0],
      command: splits[1],
      value: String(splits[2]),
    };
  } catch (e) {
    log(e);
  }
};

/**
 * Returns true if the Message author has access to the
 * command he is requesting.
 * @returns {boolean}
 */
const hasPermission = (Message, permissions, roleId, ownerId) => {
  try {
    const { guild, member, author } = Message;
    // If is a guild owner.
    if (
      permissions.owner &&
      guild &&
      String(guild.owner.id) === String(member.id)
    ) {
      return true;
    }
    // If has got a moderator role.
    if (
      permissions.moderator &&
      member &&
      member.roles.find(r => String(r.id) === String(roleId))
    ) {
      return true;
    }
    // If is a bot owner.
    if (String(author.id) === String(ownerId)) {
      return true;
    }
    return false;
  } catch (e) {
    log(e);
  }
};

module.exports = { readCommand, hasPermission };
