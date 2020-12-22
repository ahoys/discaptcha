import { Message } from 'discord.js';
import { lp, p } from 'logscribe';
import { uninstall } from '../commands/uninstall';
import { humanize } from '../commands/humanize';
import { install } from '../commands/install';
import { verifyMember } from '../handlers/handler.verifyMember';

export const execCommands = (
  message: Message,
  cmd: string,
  isOwner: boolean,
  roleName: string
) => {
  try {
    const { guild, channel, member } = message;
    if (guild && channel && member) {
      if (cmd === 'humanize' && isOwner) {
        message.channel
          .send(
            'Humanizing this server... 🧍\n\n' +
              'This may take a while. I will inform you when finished.'
          )
          .then(() => {
            humanize(guild, roleName)
              .then((msg) => {
                message.reply(msg).catch((err) => lp(err));
              })
              .catch((msg) => {
                message.reply(msg).catch((err) => lp(err));
              });
          })
          .catch((err) => {
            lp(err);
          });
      } else if (cmd === 'install' && isOwner) {
        message.channel
          .send(
            'Installing Discaptcha... 👷\n\n' +
              'This may take a while. I will inform you when finished.'
          )
          .then(() => {
            install(guild, roleName)
              .then((msg) => {
                message.reply(msg).catch((err) => lp(err));
              })
              .catch((msg) => {
                message.reply(msg).catch((err) => lp(err));
              });
          })
          .catch((err) => {
            lp(err);
          });
      } else if (cmd === 'uninstall' && isOwner) {
        message.channel
          .send(
            'Uninstalling Discaptcha... 💣\n\n' +
              'This may take a while. I will inform you when finished.'
          )
          .then(() => {
            uninstall(guild, roleName)
              .then((msg) => {
                message.reply(msg).catch((err) => lp(err));
              })
              .catch((msg) => {
                message.reply(msg).catch((err) => lp(err));
              });
          })
          .catch((err) => {
            lp(err);
          });
      } else if (cmd === 'verifyme') {
        message
          .reply('I sent you a private message.')
          .then(() => {
            verifyMember(member, roleName)
              .then((msg) => p(msg))
              .catch((msg) => lp(msg));
          })
          .catch((err) => lp(err));
      } else if (isOwner) {
        message
          .reply(
            'available commands for you are: humanize, install, uninstall, verifyme.'
          )
          .catch((err) => lp(err));
      } else {
        message
          .reply('available commands for you are: verifyme.')
          .catch((err) => lp(err));
      }
    } else {
      lp('Was unable to react to a command for an unknwon reason.');
    }
  } catch (err) {
    lp(err);
  }
};
