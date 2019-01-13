const log = require('debug')('util.guild');

module.exports = {
  /**
   * Kicks a GuildMember.
   * @param {GuildMember} GuildMember - Discord.js GuildMember object.
   * @param {string} reason - Why the user was kicked.
   * @returns {Promise}
   */
  kickGuildMember: (GuildMember, reason = 'Unspecified reason.') => {
    return new Promise((resolve, reject) => {
      if (
        GuildMember &&
        GuildMember.kick &&
        GuildMember.kickable &&
        typeof reason === 'string'
      ) {
        const User = GuildMember.user;
        GuildMember
          .kick(reason)
          .then(() => {
            const msg = User && typeof User.username === 'string'
            ? `Kicked ${User.username}: ${reason}`
            : `Kicked a guild member: ${reason}`;
            log(msg);
            resolve(msg);
          })
          .catch((e) => {
            log('Could not kick a guild member:', e);
            reject(e);
          });
      } else {
        reject('There was something wrong with the payload.');
      }
    });
  }
}
