import { Guild } from 'discord.js';
import { lp } from 'logscribe';

/**
 * Verifies all current users (including users in offline).
 * @param {Guild} guild Discord guild in question.
 */
export const humanize = (guild: Guild): Promise<string> =>
  new Promise((resolve, reject) => {
    try {
      guild.roles
        .fetch()
        .then((roles) => {
          const verifyRole = roles.cache.find((r) => r.name === 'verified');
          if (verifyRole) {
            guild.members
              .fetch()
              .then((members) => {
                for (const member of members.array()) {
                  member.roles.add(verifyRole);
                }
                resolve('members of this guild are now humanized.');
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
          reject('failed to fetch roles.');
        });
    } catch (err) {
      lp(err);
      reject('something went wrong. Could not humanize the users.');
    }
  });
