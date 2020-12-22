import { Guild } from 'discord.js';
import { lp, p } from 'logscribe';

/**
 * Removes Discaptcha roles.
 * @param {Guild} guild Discord guild in question.
 * @param {string} roleName Name of the verified role.
 */
export const uninstall = (guild: Guild, roleName: string): Promise<string> =>
  new Promise((resolve, reject) => {
    try {
      p('Executing uninstall...');
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
                    p('Uninstall finished.');
                    resolve('Discaptcha specific configurations removed.');
                  })
                  .catch((err) => {
                    lp(err);
                    reject(
                      'failed to remove the verified role. Uninstall aborted.'
                    );
                  });
              })
              .catch((err) => {
                lp(err);
                reject(
                  'failed to reset @everyone permissions.' +
                    "Perhaps I don't have all the required permissions?"
                );
              });
          } else {
            p('The verified role was not found.');
            reject('unable to uninstall. No configurations found.');
          }
        })
        .catch((err) => {
          lp(err);
          reject('failed to fetch the existing roles. Uninstall aborted.');
        });
    } catch (err) {
      lp(err);
      reject('something went wrong. Could not uninstall.');
    }
  });
