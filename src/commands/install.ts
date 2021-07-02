import humanize from './humanize';
import { Guild } from 'discord.js';
import { p } from 'logscribe';

/**
 * Creates a new verified role and assigns it to everyone.
 */
const createAndAssignVerified = (
  guild: Guild,
  roleName: string,
  resolve: (value: string | PromiseLike<string>) => void,
  reject: (reason?: string) => void
) => {
  // Create the verified role.
  // Users with this role are considered human.
  guild.roles
    .create({
      data: {
        name: roleName,
        permissions: ['SEND_MESSAGES', 'SPEAK'],
      },
      reason: 'Discaptcha install command executed.',
    })
    .then(() => {
      // Humanize existing users.
      humanize
        .execute(guild, roleName)
        .then(() => {
          // Make sure the @everyone-role does not allow speaking.
          const everyoneRole = guild.roles.everyone;
          const newPermissions = everyoneRole.permissions
            .remove('SEND_MESSAGES')
            .remove('SPEAK');
          everyoneRole
            .setPermissions(newPermissions)
            .then(() => {
              resolve(
                'Installation done. Discaptcha is ready to serve this guild.'
              );
            })
            .catch((err) => {
              p(err);
              reject(
                'Was unable to set the proper @everyone permissions. ' +
                  'See the console for more.'
              );
            });
        })
        .catch((msg) => {
          reject(msg);
        });
    })
    .catch((err) => {
      p(err);
      reject(
        `Failed to create the verified role (${roleName}). ` +
          "Perhaps I don't have all the required permissions? " +
          'See the console for more.'
      );
    });
};

/**
 * Verifies all current users (including offline users).
 */
const install = {
  name: 'install',
  description: 'Installs the bot for the guild.',
  execute: (guild: Guild, roleName: string): Promise<string> =>
    new Promise((resolve, reject) => {
      try {
        // Find and remove all the existing verified roles.
        guild.roles
          .fetch()
          .then((roles) => {
            const verifyRole = roles.cache.find((r) => r.name === roleName);
            if (verifyRole) {
              // Old role found.
              verifyRole
                .delete('Replacing the old role with a new one.')
                .then(() => {
                  createAndAssignVerified(guild, roleName, resolve, reject);
                })
                .catch((err) => {
                  p(err);
                  reject(
                    'Failed to remove the old verified role. Installation failed. ' +
                      'Do I have the necessary privileges? ' +
                      'See the console for more.'
                  );
                });
            } else {
              // No old roles found.
              createAndAssignVerified(guild, roleName, resolve, reject);
            }
          })
          .catch((err) => {
            p(err);
            reject(
              'Failed to fetch the existing roles. Installation failed. ' +
                'Connection issues perhaps? See the console for more.'
            );
          });
      } catch (err) {
        p(err);
        reject(
          'Something unexpected went wrong. Could not install. ' +
            'See the console for more.'
        );
      }
    }),
};

export default install;

// import { Guild } from 'discord.js';
// import { lp, p } from 'logscribe';
// import { humanize } from './humanize';

// /**
//  * Installs Discaptcha for the guild.
//  * @param {Guild} guild Discord guild in question.
//  * @param {string} roleName Name of the verified role.
//  */
// export const install = (guild: Guild, roleName: string): Promise<string> =>
//   new Promise((resolve, reject) => {
//     try {
//       p('Executing install...');
//       // Find and remove all existing verified roles.
//       guild.roles
//         .fetch()
//         .then((roles) => {
//           const verifyRole = roles.cache.find((r) => r.name === roleName);
//           if (verifyRole) {
//             // Old role found.
//             verifyRole
//               .delete('Replacing the old role with a new one.')
//               .then(() => {
//                 createAndAssignVerified(guild, roleName, resolve, reject);
//               })
//               .catch((err) => {
//                 lp(err);
//                 reject('failed to remove the old verified role.');
//               });
//           } else {
//             // No old roles found.
//             createAndAssignVerified(guild, roleName, resolve, reject);
//           }
//         })
//         .catch((err) => {
//           lp(err);
//           reject('failed to fetch the existing roles.');
//         });
//     } catch (err) {
//       reject('failed to install.');
//       lp(err);
//     }
//   });
