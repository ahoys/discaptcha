const log = require('debug')('util.guild');

/**
 * Kicks a GuildMember.
 * @param {GuildMember} GuildMember - Discord.js GuildMember object.
 * @param {string} reason - Why the user was kicked.
 * @returns {Promise}
 */
const kickGuildMember = (GuildMember, reason = 'Unspecified reason.') => {
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

/**
 * Adds a role to a collection of members.
 * @param {boolean} doAddRole - Whether to add or remove the Role.
 * @param {*} Role 
 * @param {*} GuildMembers 
 * @param {*} reason 
 */
const adjustRoleOfMembers = (doAddRole, Role, GuildMembers, reason = '') => {
  return new Promise((resolve, reject) => {
    const membersArray = GuildMembers.array();
    const length = membersArray.length;
    let i = 0;
    const addRoleToMember = (GuildMember) => {
      if (doAddRole) {
        // Adding a role...
        GuildMember
          .addRole((Role, reason))
          .then(() => {
            i += 1;
            if (i >= length) {
              resolve(i);
            } else {
              addRoleToMember(membersArray[i]);
            }
          });
      } else {
        // Removing a role...
        GuildMember
          .removeRole((Role, reason))
          .then(() => {
            i += 1;
            if (i >= length) {
              resolve(i);
            } else {
              addRoleToMember(membersArray[i]);
            }
          });
      }
    };
    if (membersArray[i]) {
      addRoleToMember(membersArray[i]);
    } else {
      reject(0);
    }
  });
}

module.exports = {
  kickGuildMember,
  adjustRoleOfMembers,
};
