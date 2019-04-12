const config = require('../../configs/config.json');
const { l, lp } = require('logscribe').default('util.guild', '\x1b[31m');

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
      GuildMember.kick(reason)
        .then(() => {
          const msg =
            User && typeof User.username === 'string'
              ? `Kicked ${User.username}: ${reason}`
              : `Kicked a guild member: ${reason}`;
          l(msg);
          resolve(msg);
        })
        .catch(e => {
          lp('Could not kick a guild member:', e);
          reject(e);
        });
    } else {
      reject(
        'There was something wrong with the payload. ' +
        'Maybe the target was not kickable?'
      );
    }
  });
};

/**
 * Either adds or removes roles from GuildMembers.
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
    const addRoleToMember = GuildMember => {
      if (doAddRole) {
        // Adding a role...
        GuildMember.addRole(Role, reason).then(() => {
          i += 1;
          if (i >= length) {
            resolve(i);
          } else {
            addRoleToMember(membersArray[i]);
          }
        });
      } else {
        // Removing a role...
        GuildMember.removeRole(Role, reason).then(() => {
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
      resolve(0);
    }
  });
};

/**
 * Returns the verification role for the guild.
 * @param {Guild} Guild - Discord.js Guild object.
 */
const getVerificationRoleOfGuild = Guild => {
  try {
    const verifiedRoleId = config.guilds[Guild.id].verificationRoleId;
    return Guild.roles.find(r => String(r.id) === String(verifiedRoleId));
  } catch (e) {
    lp('Failed getVerificationRoleOfGuild.', e);
  }
};

/**
 * Returns all members of the guild who have or
 * do not have some certain Role.
 * @param {Guild} Guild - Discord.js Guild object.
 * @param {boolean} hasRole - Must have the role.
 * @param {Role} Role - Discord.js Role object.
 */
const getGuildMembersWithOrWithoutRole = (Guild, hasRole = true, Role) => {
  return new Promise((resolve, reject) => {
    Guild.fetchMembers().then(GuildWithMembers => {
      resolve(
        hasRole
          ? GuildWithMembers.members.filter(m =>
              m.roles.find(r => r.id === Role.id)
            )
          : GuildWithMembers.members.filter(
              m => m.roles.find(r => r.id === Role.id) === null
            )
      );
    });
  });
};

module.exports = {
  kickGuildMember,
  adjustRoleOfMembers,
  getVerificationRoleOfGuild,
  getGuildMembersWithOrWithoutRole,
};
