import { Guild } from 'discord.js';
import { p } from 'logscribe';
import { verifyMember } from '../handlers/handler.verifyMember';

/**
 * Verifies all current users (including offline users).
 */
const verifyme = {
  name: 'verifyme',
  description:
    'For testing purposes, you can manually trigger the verification process.',
  execute: (
    guild: Guild,
    roleName: string,
    requesterId: string
  ): Promise<string> =>
    new Promise((resolve, reject) => {
      try {
        guild.members
          .fetch(requesterId)
          .then((member) => {
            if (member) {
              verifyMember(member, roleName)
                .then((msg) => resolve(msg))
                .catch((msg) => reject(msg));
            } else {
              reject('Unable to find the guild member.');
            }
          })
          .catch((err) => {
            p(err);
            reject('Failed to fetch members. ' + 'See console for more.');
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

export default verifyme;
