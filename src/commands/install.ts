import { Guild } from 'discord.js';
import { lp } from 'logscribe';
import { humanize } from './humanize';

/**
 * Creates a new verified role and assigns it to everyone.
 * @param {Guild} guild Discord guild in question.
 * @param {function} resolve Resolve callback.
 * @param {function} reject Reject callback.
 */
const createAndAssignVerified = (
  guild: Guild,
  resolve: (value: string | PromiseLike<string>) => void,
  reject: (reason?: string) => void
) => {
  // Create the verified role.
  // Users with this role are considered human.
  guild.roles
    .create({
      data: {
        name: 'verified',
        permissions: ['SEND_MESSAGES', 'SPEAK'],
      },
      reason: 'Discaptcha install command executed.',
    })
    .then(() => {
      // Make sure the @everyone-role does not allow speaking.
      const everyoneRole = guild.roles.everyone;
      const newPermissions = everyoneRole.permissions
        .remove('SEND_MESSAGES')
        .remove('SPEAK');
      everyoneRole.setPermissions(newPermissions).then(() => {
        // Humanize all already existing users.
        humanize(guild)
          .then(() => {
            resolve(
              'installation done. Discaptcha is ready to serve this guild.'
            );
          })
          .catch((msg) => {
            reject(msg);
          });
      });
    })
    .catch((err) => {
      lp(err);
      reject('Failed to create the verified role.');
    });
};

/**
 * Installs Discaptcha for the guild.
 * @param {Guild} guild Discord guild in question.
 */
export const install = (guild: Guild): Promise<string> =>
  new Promise((resolve, reject) => {
    try {
      // Find and remove all existing verified roles.
      guild.roles
        .fetch()
        .then((roles) => {
          const verifyRole = roles.cache.find((r) => r.name === 'verified');
          if (verifyRole) {
            // Old role found.
            verifyRole
              .delete()
              .then(() => {
                createAndAssignVerified(guild, resolve, reject);
              })
              .catch((err) => {
                lp(err);
                reject('failed to remove the old verified role.');
              });
          } else {
            // No old roles found.
            createAndAssignVerified(guild, resolve, reject);
          }
        })
        .catch((err) => {
          lp(err);
          reject('failed to fetch existing roles.');
        });
    } catch (err) {
      reject('failed to install.');
      lp(err);
    }
  });
