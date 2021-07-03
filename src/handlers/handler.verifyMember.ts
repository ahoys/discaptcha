import { GuildMember } from 'discord.js';
import { p } from 'logscribe';

/**
 * Verifies the user to be a human.
 * @param {GuildMember} guildMember The user to be verified.
 * @param {string} roleName Name of the verified role.
 */
export const verifyMember = (
  guildMember: GuildMember,
  roleName: string
): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!guildMember) {
      reject('Could not find the guild member.');
    }
    // First create a DM-channel and send a welcome message with
    // instructions.
    guildMember.user
      .createDM()
      .then((DMChannel) => {
        DMChannel.send(
          `Welcome to ${guildMember.guild.name}! Please verify yourself to continue.\n\n` +
            'Before you can participate, you must verify that you are not a spam bot.\n' +
            'To verify, all you need to do is to click the 👌 -emoji below.'
        )
          .then((message) => {
            // React with an emoji so the user will have something to click.
            // This click will verify the user.
            message
              .react('👌')
              .then(() => {
                const collector = message.createReactionCollector(
                  (reaction) =>
                    reaction.emoji.name === '👌' ||
                    reaction.emoji.name === '💩',
                  {
                    // 15 mins.
                    time: 900000,
                  }
                );
                collector.on('collect', () => {
                  // A click was collected. No need to continue.
                  collector.stop();
                });
                collector.on('end', (r) => {
                  // Count how many reactions was collected.
                  if (r.size > 0) {
                    // We now know the user is a human and not a bot.
                    // Give the user the verified role of the guild.
                    guildMember.guild.roles.fetch().then((roles) => {
                      const verifyRole = roles.cache.find(
                        (vr) => vr.name === roleName
                      );
                      if (verifyRole) {
                        guildMember.roles
                          .add(verifyRole)
                          .then(() => {
                            DMChannel.send(
                              'Thank you, human!\n\nYou are now verified.'
                            );
                            resolve(
                              `Verified ${guildMember.user.username} (${guildMember.user.id}).`
                            );
                          })
                          .catch((err) => {
                            p(err);
                            DMChannel.send(
                              'Verifying you failed. Please try to rejoin the ' +
                                'server or contact the server owner for further support.'
                            );
                            reject(
                              'Was unable to add a role. Perhaps missing permissions?'
                            );
                          });
                      } else {
                        DMChannel.send(
                          'How embarrassing, the server has not been configured ' +
                            'properly. I am unable to set the proper role for you.\n\n' +
                            'Please contact the server owner about the issue.'
                        );
                        reject(
                          'The verified role was missing. Unable to verify.'
                        );
                      }
                    });
                  } else {
                    // Not enough clicks. A spam bot detected!
                    DMChannel.send(
                      'Your action took too long 🤖.\n\n' +
                        'You cannot participate without verifying yourself.\n' +
                        'Feel free to try again by rejoining the server.\n\n' +
                        'If you are facing issues with the process, ' +
                        'try contacting the moderators of the server.'
                    );
                    reject(
                      'User ' +
                        guildMember.user.username +
                        ' verification failed. ' +
                        'The reaction emoji was not clicked in time: '
                    );
                  }
                });
              })
              .catch(() => {
                DMChannel.send(
                  'Verifying you failed. Please try to rejoin the ' +
                    'server or contact the server owner for further support.'
                );
                reject('Unable to react.');
              });
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch(() => {
        reject('Failed to create DM.');
      });
  });
