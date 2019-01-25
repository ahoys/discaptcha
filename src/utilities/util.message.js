const { Map } = require('immutable');
const { lp } = require('logscribe').default('util.message', '\x1b[31m');
let guildSpam = Map({});

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
    lp(e);
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
    lp(e);
  }
};

/**
 * Returns true if the Guild is spamming.
 * @param {*} Guild - Discord.js Guild.
 * @param {number} guildSpamLimit - What's the limit for spam (ms)?
 */
const isGuildSpamming = (Guild, guildSpamLimit = 1000) => {
  try {
    const now = new Date().getTime();
    if (guildSpam.has(Guild.id)) {
      const timeBetween = now - guildSpam.get(Guild.id);
      if (timeBetween < guildSpamLimit) {
        // Spamming!
        lp(
          `Guild "${Guild.id}" is spamming. ` +
            `Repeat interval: ${timeBetween}ms.`
        );
        guildSpam = guildSpam.set(Guild.id, now);
        return true;
      } else {
        guildSpam = guildSpam.set(Guild.id, now);
        return false;
      }
    } else {
      guildSpam = guildSpam.set(Guild.id, now);
      return false;
    }
  } catch (e) {
    lp(e);
    return false;
  }
};

module.exports = { readCommand, hasPermission, isGuildSpamming };
