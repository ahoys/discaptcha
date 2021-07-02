import { Guild } from 'discord.js';
import { p } from 'logscribe';

/**
 * Uninstalls the installation for a guild.
 * This means removing all the modifications and roles.
 */
const uninstall = {
  name: 'uninstall',
  description: 'Uninstalls the bot, reverting all modifications to the guild.',
  execute: (guild: Guild, roleName: string): Promise<string> =>
    new Promise((resolve, reject) => {
      try {
        guild.roles
          .fetch()
          .then((roles) => {
            const verifyRole = roles.cache.find((r) => r.name === roleName);
            if (verifyRole) {
              const everyoneRole = guild.roles.everyone;
              const newPermissions = everyoneRole.permissions
                .add('SEND_MESSAGES')
                .add('SPEAK');
              everyoneRole
                .setPermissions(newPermissions)
                .then(() => {
                  verifyRole
                    .delete('Discaptcha uninstall command executed.')
                    .then(() => {
                      resolve('Discaptcha specific configurations removed.');
                    })
                    .catch((err) => {
                      p(err);
                      reject(
                        'Failed to remove the verified role. Uninstall aborted. ' +
                          'See console for more.'
                      );
                    });
                })
                .catch((err) => {
                  p(err);
                  reject(
                    'Failed to reset @everyone permissions.' +
                      "Perhaps I don't have all the required permissions? " +
                      'See console for more.'
                  );
                });
            } else {
              p('The verified role was not found.');
              reject('Unable to uninstall. No configurations found.');
            }
          })
          .catch((err) => {
            p(err);
            reject(
              'Failed to fetch the existing roles. Uninstall aborted. ' +
                'See console for more.'
            );
          });
      } catch (err) {
        p(err);
        reject(
          'Something unexpected went wrong. Could not uninstall. ' +
            'See console for more.'
        );
      }
    }),
};

export default uninstall;
