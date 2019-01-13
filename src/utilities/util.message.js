const log = require('debug')('util.message');

module.exports = {
  /**
   * Maps a message into a commanding frame.
   * This simplifies reading commands from messages.
   * @returns {object}
   */
  readCommand: (Message) => {
    const splits = Message.content.split(' ', 3);
    return {
      mention: splits[0],
      command: splits[1],
      value: String(splits[2])
    }
  },
  /**
   * Returns true if the Message author has access to the
   * command he is requesting.
   * @returns {boolean}
   */
  hasPermission: (Message, permissions, roleId, ownerId) => {
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
  },
};
