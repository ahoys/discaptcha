import { Guild } from 'discord.js';
import { lp } from 'logscribe';

const roleName = process.env.ROLE_NAME || 'verified';

/**
 * Removes Discaptcha roles.
 * @param {Guild} guild Discord guild in question.
 */
export const uninstall = (guild: Guild): Promise<string> =>
  new Promise((resolve, reject) => {
    try {
      guild.roles
        .fetch()
        .then((roles) => {
          const verifyRole = roles.cache.find((r) => r.name === roleName);
          if (verifyRole) {
            verifyRole
              .delete('Discaptcha uninstall command executed.')
              .then(() => {
                const everyoneRole = guild.roles.everyone;
                const newPermissions = everyoneRole.permissions
                  .add('SEND_MESSAGES')
                  .add('SPEAK');
                everyoneRole
                  .setPermissions(newPermissions)
                  .then(() => {
                    resolve(
                      'discaptcha specific configurations has been removed.'
                    );
                  })
                  .catch((err) => {
                    lp(err);
                    reject('failed to reset @everyone permissions.');
                  });
              })
              .catch((err) => {
                lp(err);
                reject(
                  'failed to remove the verified role. Uninstall aborted.'
                );
              });
          } else {
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
