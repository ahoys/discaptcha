import { Guild } from 'discord.js';
import { lp, p } from 'logscribe';

const roleName = process.env.ROLE_NAME || 'Verified';

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
                const readyCallBack = () => {
                  resolve('members of this guild are now humanized.');
                };
                const allMembers = members.array();
                const len = allMembers.length;
                let i = 0;
                for (const member of allMembers) {
                  member.roles
                    .add(verifyRole)
                    .then((guildMember) => {
                      i += 1;
                      p(
                        `Verified ${guildMember.user.username} ` +
                          `(${guildMember.user.id}).`
                      );
                      if (i === len) {
                        readyCallBack();
                      }
                    })
                    .catch(() => {
                      reject(
                        'Was unable to add a new role. Perhaps missing permissions?'
                      );
                    });
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
