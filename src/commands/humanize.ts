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
                const allMembers = members.array();
                const len = allMembers.length;
                const readyCallBack = (failedNum: number, changed: number) => {
                  if (failedNum >= len) {
                    reject(
                      'failed to humanaize. ' +
                        'Do I have the required permissions?'
                    );
                  } else if (failedNum) {
                    resolve(
                      `done, but could not humanize ${failedNum} member(s). ` +
                        'Maybe they left during the process?'
                    );
                  } else if (changed === 0) {
                    resolve(
                      'no humanizing necessary. ' +
                        `Everyone already got the "${roleName}" role.`
                    );
                  } else {
                    resolve('members of this guild are now humanized.');
                  }
                };
                let i = 0;
                let r = 0;
                let c = 0;
                for (const member of allMembers) {
                  if (
                    member.roles.cache.find((role) => role.name === roleName)
                  ) {
                    // Already has the role.
                    i += 1;
                    if (i === len) {
                      readyCallBack(r, c);
                    }
                  } else {
                    // Missing the role.
                    member.roles
                      .add(verifyRole)
                      .then((guildMember) => {
                        i += 1;
                        c += 1;
                        p(
                          `Verified ${guildMember.user.username} ` +
                            `(${guildMember.user.id}).`
                        );
                        if (i === len) {
                          readyCallBack(r, c);
                        }
                      })
                      .catch(() => {
                        r += 1;
                        i += 1;
                        if (i === len) {
                          readyCallBack(r, c);
                        }
                      });
                  }
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
