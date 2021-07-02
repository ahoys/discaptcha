import { Guild } from 'discord.js';
import { p } from 'logscribe';

/**
 * Verifies all current users (including offline users).
 */
const humanize = {
  name: 'humanize',
  description: 'Makes all the currently present users verified.',
  execute: (guild: Guild, roleName: string): Promise<string> =>
    new Promise((resolve, reject) => {
      try {
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
                  const readyCallBack = (
                    failedNum: number,
                    changed: number
                  ) => {
                    if (failedNum >= len) {
                      reject(
                        'Failed to humanize. ' +
                          'Do I have the required permissions?'
                      );
                    } else if (failedNum) {
                      resolve(
                        `Done, but could not humanize ${failedNum} member(s). ` +
                          'Maybe they left during the process?'
                      );
                    } else if (changed === 0) {
                      resolve(
                        'No humanizing necessary. ' +
                          `Everyone already got the "${roleName}" role.`
                      );
                    } else {
                      resolve('Members of this guild are now humanized.');
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
                  p(err);
                  reject(
                    'Unable to fetch members from Discord. ' +
                      'Try again later or see if there are any updates for me. ' +
                      'See console for more.'
                  );
                });
            } else {
              reject(
                `The "${roleName}" role was not found. Make sure to run the "install" command first.`
              );
            }
          })
          .catch((err) => {
            p(err);
            reject(
              'Someting went wrong. Could not fetch roles from Discord. ' +
                'See console for more.'
            );
          });
      } catch (err) {
        p(err);
        reject(
          'Something unexpected went wrong. Could not humanize the users. ' +
            'See console for more.'
        );
      }
    }),
};

export default humanize;
