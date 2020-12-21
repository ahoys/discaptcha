import { Guild } from 'discord.js';
import { lp, p } from 'logscribe';

const roleName = process.env.ROLE_NAME || 'verified';

/**
 * Verifies all current users (including users in offline).
 * @param {Guild} guild Discord guild in question.
 */
export const humanize = (guild: Guild): Promise<string> =>
  new Promise((resolve, reject) => {
    try {
      p('Executing humanize...');
      guild.roles
        .fetch()
        .then((roles) => {
          const verifyRole = roles.cache.find((r) => r.name === roleName);
          if (verifyRole) {
            guild.members
              .fetch()
              .then((members) => {
                let failure = false;
                for (const member of members.array()) {
                  member.roles
                    .add(verifyRole)
                    .then((guildMember) => {
                      p(
                        `Verified ${guildMember.user.username} ` +
                          `(${guildMember.user.id}).`
                      );
                    })
                    .catch(() => {
                      failure = true;
                    });
                }
                if (failure) {
                  reject(
                    'Was unable to add a role. Perhaps missing permissions?'
                  );
                } else {
                  resolve('members of this guild are now humanized.');
                }
              })
              .catch((err) => {
                lp(err);
                reject('failed to humanize members.');
              });
          } else {
            reject(
              'the verified role was not found. Make sure to run "install" command first.'
            );
          }
        })
        .catch((err) => {
          lp(err);
          reject('failed to fetch the roles.');
        });
    } catch (err) {
      lp(err);
      reject('something went wrong. Could not humanize the users.');
    }
  });
