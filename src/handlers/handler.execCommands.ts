import { Guild, User } from 'discord.js';
import { p } from 'logscribe';
import { uninstall } from '../commands/uninstall';
import { humanize } from '../commands/humanize';
import { install } from '../commands/install';
import { verifyMember } from '../handlers/handler.verifyMember';

/**
 * Executes the given commands.
 * @param message Discord Message object in question.
 * @param cmd The read command.
 * @param isOwner Whether the caller is the owner.
 * @param roleName Name of the verified-role.
 */
export const execCommands = (
  guild: Guild,
  user: User,
  cmd: string,
  isOwner: boolean,
  roleName: string,
  messageCallback: (content: string) => void
) => {
  try {
    if (guild && user) {
      if (cmd === 'humanize' && isOwner) {
        messageCallback(
          'Humanizing this server... 🧍\n\n' +
            'This may take a while. I will inform you when finished.'
        );
        humanize(guild, roleName)
          .then((msg) => {
            messageCallback(msg);
          })
          .catch((msg) => {
            messageCallback(msg);
          });
      } else if (cmd === 'install' && isOwner) {
        messageCallback(
          'Installing Discaptcha... 👷\n\n' +
            'This may take a while. I will inform you when finished.'
        );
        install(guild, roleName)
          .then((msg) => {
            messageCallback(msg);
          })
          .catch((msg) => {
            messageCallback(msg);
          });
      } else if (cmd === 'uninstall' && isOwner) {
        messageCallback(
          'Uninstalling Discaptcha... 💣\n\n' +
            'This may take a while. I will inform you when finished.'
        );
        uninstall(guild, roleName)
          .then((msg) => {
            messageCallback(msg);
          })
          .catch((msg) => {
            messageCallback(msg);
          });
      } else if (cmd === 'verifyme') {
        messageCallback('I sent you a private message.');
        const member = guild.members.cache.get(user.id);
        if (member) {
          verifyMember(member, roleName)
            .then((msg) => p(msg))
            .catch((msg) => p(msg));
        }
      } else if (isOwner) {
        messageCallback(
          'available commands for you are: humanize, install, uninstall, verifyme.'
        );
      } else {
        messageCallback('available commands for you are: verifyme.');
      }
    } else {
      p('Was unable to react to a command for an unknwon reason.');
    }
  } catch (err) {
    p(err);
  }
};
