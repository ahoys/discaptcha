import DiscordJs, { Intents } from 'discord.js';
import { config } from 'dotenv';
import { lp, p } from 'logscribe';
import { verifyMember } from './handlers/handler.verifyMember';
import { execCommands } from './handlers/handler.execCommands';

config({ path: __dirname + '/.env' });
const { APP_TOKEN, APP_ID, OWNER_ID, ROLE_NAME } = process.env;

const roleName = ROLE_NAME || 'Verified';

if (!APP_TOKEN || !APP_ID || !OWNER_ID || !roleName) {
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
    if (
      Client.user &&
      Message.mentions.has(Client.user.id) &&
      !Message.mentions.everyone
    ) {
      const { content } = Message;
      const cmd = content.split(' ')[1];
      // See if the message contains a command.
      if (typeof cmd === 'string') {
        const isAdministrator =
          Message.guild?.me?.hasPermission('ADMINISTRATOR');
        const canSendMessages =
          Message.guild?.me?.hasPermission('SEND_MESSAGES');
        if (isAdministrator) {
          // We got all the permissions we require.
          execCommands(Message, cmd, Message.author.id === OWNER_ID, roleName);
        } else if (canSendMessages && !isAdministrator) {
          // Inform about the missing permission.
          Message.channel
            .send(
              "I don't have enough permissions to execute commands. " +
                'Give me the administrator permission.'
            )
            .catch((err) => lp(err));
        } else {
          // No permissions at all.
          lp('Was unable to function. ADMINISTRATOR permission is missing.');
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
    verifyMember(GuildMember, roleName)
      .then((msg) => p(msg))
      .catch((err) => lp(err));
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
