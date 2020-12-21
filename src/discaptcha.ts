import DiscordJs, { Intents } from 'discord.js';
import { config } from 'dotenv';
import { p } from 'logscribe';
import { botify } from './commands/botify';
import { humanize } from './commands/humanize';
import { install } from './commands/install';
import { test } from './commands/test';

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
  if (Client.user && Message.mentions.has(Client.user.id)) {
    const { author, content, guild } = Message;
    if (author.id === OWNER_ID) {
      const supportedCommands = ['botify', 'humanize', 'install', 'test'];
      const cSplit = content.split(' ');
      const cmd = cSplit[1];
      if (guild && cmd && supportedCommands.includes(cmd)) {
        if (cmd === 'botify') {
          botify(guild)
            .then((msg) => {
              Message.reply(msg);
            })
            .catch((msg) => {
              Message.reply(msg);
            });
        } else if (cmd === 'humanize') {
          humanize(guild)
            .then((msg) => {
              Message.reply(msg);
            })
            .catch((msg) => {
              Message.reply(msg);
            });
        } else if (cmd === 'install') {
          install(guild)
            .then((msg) => {
              Message.reply(msg);
            })
            .catch((msg) => {
              Message.reply(msg);
            });
        } else if (cmd === 'test') {
          test(guild)
            .then((msg) => {
              Message.reply(msg);
            })
            .catch((msg) => {
              Message.reply(msg);
            });
        }
      } else {
        Message.reply(
          `supported commands are: ${supportedCommands.map((c, i) =>
            i === 0 ? c : ` ${c}`
          )}.`
        );
      }
    }
  }
});

/**
 * A new guild member joined.
 * This is the main event as we are required to
 * verify member's "humanity".
 */
Client.on('guildMemberAdd', (GuildMember) => {
  console.log('New member');
});

/**
 * Something went wrong with Discord.
 * Probably Internet related issues.
 */
Client.on('error', () => {
  login();
});

login();
