import DiscordJs, { Intents } from 'discord.js';
import { config } from 'dotenv';
import { lp, p } from 'logscribe';
import { uninstall } from './commands/uninstall';
import { humanize } from './commands/humanize';
import { install } from './commands/install';
import { verifyMember } from './handlers/handler.verifyMember';

config({ path: __dirname + '/.env' });
const { APP_TOKEN, APP_ID, OWNER_ID } = process.env;

if (!APP_TOKEN || !APP_ID || !OWNER_ID) {
  throw new Error('Missing .env file or invalid values.');
}

const intents = new Intents(Intents.NON_PRIVILEGED);
intents.add('GUILD_MEMBERS');
const Client = new DiscordJs.Client({ ws: { intents } });

/**
 * Logs into Discord.
 */
let reconnect: any = null;
const login = () => {
  Client.login(APP_TOKEN).catch((err) => {
    p(err);
    console.error('Failed to login.');
    clearTimeout(reconnect);
    reconnect = setTimeout(() => {
      login();
    }, 10240);
  });
};

/**
 * The bot is ready to function.
 * Inform the user about it.
 */
Client.on('ready', () => {
  p(
    'Successfully connected to Discord!\n' +
      `Username: ${Client.user?.username}\n` +
      `Id: ${Client.user?.id}\n` +
      `Verified: ${Client.user?.verified}\n` +
      'Waiting for events...'
  );
});

/**
 * A new message read.
 * Messages are used to control the bot.
 */
Client.on('message', (Message) => {
  try {
    if (Client.user && Message.mentions.has(Client.user.id)) {
      const { author, content, guild, member } = Message;
      const cmd = content.split(' ')[1];
      if (typeof cmd === 'string' && guild && member) {
        if (
          author.id === OWNER_ID &&
          ['humanize', 'install', 'uninstall'].includes(cmd)
        ) {
          // Commands that require owner-access.
          if (cmd === 'humanize') {
            humanize(guild)
              .then((msg) => {
                Message.reply(msg).catch(() => {
                  p('Unable to speak. Permission issues detected.');
                });
              })
              .catch((msg) => {
                Message.reply(msg).catch(() => {
                  p('Unable to speak. Permission issues detected.');
                });
              });
          } else if (cmd === 'install') {
            install(guild)
              .then((msg) => {
                Message.reply(msg).catch(() => {
                  p('Unable to speak. Permission issues detected.');
                });
              })
              .catch((msg) => {
                Message.reply(msg).catch(() => {
                  p('Unable to speak. Permission issues detected.');
                });
              });
          } else if (cmd === 'uninstall') {
            uninstall(guild)
              .then((msg) => {
                Message.reply(msg).catch(() => {
                  p('Unable to speak. Permission issues detected.');
                });
              })
              .catch((msg) => {
                Message.reply(msg).catch(() => {
                  p('Unable to speak. Permission issues detected.');
                });
              });
          }
        } else if (['verifyme'].includes(cmd)) {
          // Commands that are free for all.
          if (cmd === 'verifyme') {
            verifyMember(member)
              .then((msg) => {
                p(msg);
              })
              .catch((msg) => {
                p(msg);
              });
          }
        } else {
          Message.reply(
            author.id === OWNER_ID
              ? 'the available commands for you are: humanize, install, uninstall and verifyme.'
              : 'the available commands for you are: verifyme.'
          ).catch(() => {
            p('Unable to speak. Permission issues detected.');
          });
        }
      }
    }
  } catch (err) {
    lp(err);
  }
});

/**
 * A new guild member joined.
 * This is the main event as we are required to
 * verify member's "humanity".
 */
Client.on('guildMemberAdd', (GuildMember) => {
  try {
    verifyMember(GuildMember)
      .then((msg) => {
        p(msg);
      })
      .catch((msg) => {
        p(msg);
      });
  } catch (err) {
    lp(err);
  }
});

/**
 * Something went wrong with Discord.
 * Probably Internet related issues.
 */
Client.on('error', () => {
  try {
    login();
  } catch (err) {
    lp(err);
  }
});

login();
