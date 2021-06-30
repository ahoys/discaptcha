import DiscordJs, { Intents, TextChannel } from 'discord.js';
import superagent from 'superagent';
import { config } from 'dotenv';
import { p } from 'logscribe';
import { verifyMember } from './handlers/handler.verifyMember';
import { execCommands } from './handlers/handler.execCommands';

// Load custom configurations.
config({ path: __dirname + '/.env' });
const APP_TOKEN = process.env.APP_TOKEN ?? '';
const APP_ID = process.env.APP_ID ?? '';
const OWNER_ID = process.env.OWNER_ID ?? '';
const ROLE_NAME = process.env.ROLE_NAME ?? 'Verified';

// Look for invalid configuration.
// The values here are approximations.
if (
  APP_TOKEN.length < 8 ||
  APP_ID.length < 8 ||
  OWNER_ID.length < 4 ||
  ROLE_NAME.length < 1
) {
  throw new Error(
    'Missing configuration. Create an ".env" file and add APP_TOKEN, APP_ID, OWNER_ID and ROLE_NAME values.'
  );
}

// Create a new Discord client.
const intents = new Intents(Intents.NON_PRIVILEGED);
intents.add('GUILD_MEMBERS');
const client = new DiscordJs.Client({ ws: { intents } });
let reconnect: any = null;

/**
 * Log-in the client.
 * If the process fails, wait and try again.
 */
const login = () => {
  client.login(APP_TOKEN).catch((err) => {
    p(err);
    clearTimeout(reconnect);
    reconnect = setTimeout(() => {
      login();
    }, 10240);
  });
};

/**
 * The bot is ready to function (connected to Discord).
 * Make sure all the required commands are registered.
 */
client.on('ready', () => {
  p(
    'Successfully connected to Discord!\n' +
      `Username: ${client.user?.username}\n` +
      `Id: ${client.user?.id}\n` +
      `Verified: ${client.user?.verified}\n` +
      'Waiting for events...'
  );
  // All the available commands to be registered.
  const commands = [
    {
      name: 'install',
      description: 'Installs the bot for the guild.',
    },
    {
      name: 'uninstall',
      description: 'Uninstalls the bot from the guild.',
    },
    {
      name: 'humanize',
      description: 'Makes all the currently present users verified.',
    },
    {
      name: 'verifyme',
      description:
        'For testing purposes, you can manually trigger the verification process.',
    },
  ];
  // Setup slash commands.
  superagent
    .get(`https://discord.com/api/v8/applications/${APP_ID}/commands`)
    .type('application/json')
    .set('Authorization', `Bot ${APP_TOKEN}`)
    .then((res) => {
      const body = res?.body;
      if (body) {
        // Names of commands that should be registered.
        const names: string[] = commands.map(
          (cmd: { name: string }) => cmd.name ?? ''
        );
        // Names of commands that actually are registered.
        const storedNames: string[] = body.map(
          (cmd: { name: string }) => cmd.name ?? ''
        );
        // Add missing commands to the registry.
        commands.forEach((cmd) => {
          if (!storedNames.includes(cmd.name)) {
            superagent
              .post(
                `https://discord.com/api/v8/applications/${APP_ID}/commands`
              )
              .type('application/json')
              .set('Authorization', `Bot ${APP_TOKEN}`)
              .send(cmd)
              .then(() => {
                p(`Registered a missing slash command: ${cmd.name}.`);
              })
              .catch((err) => {
                p(err);
              });
          }
        });
        // Remove extra commands from registry.
        const extras = body.filter(
          (cmd: { name: string }) => !names.includes(cmd.name)
        );
        extras.forEach((cmd: { id: string; name: string }) => {
          superagent
            .delete(
              `https://discord.com/api/v8/applications/${APP_ID}/commands/${cmd.id}`
            )
            .type('application/json')
            .set('Authorization', `Bot ${APP_TOKEN}`)
            .then(() => {
              p(`Removed an extra slash command: ${cmd.name}.`);
            })
            .catch((err) => {
              p(err);
            });
        });
      } else {
        p('Discord API returned an invalid body.');
      }
    })
    .catch((err) => {
      p(err);
    });
});

/**
 * A new guild member joined.
 * This is the "main event" as we are required to
 * verify member's "humanity".
 */
client.on('guildMemberAdd', (GuildMember) => {
  try {
    verifyMember(GuildMember, ROLE_NAME)
      .then((msg) => p(msg))
      .catch((err) => p(err));
  } catch (err) {
    p(err);
  }
});

/**
 * Something went wrong with Discord.
 * Probably connection related issues.
 */
client.on('error', () => {
  try {
    login();
  } catch (err) {
    p(err);
  }
});

/**
 * Triggers an interaction callback. The point is to respond to an
 * interaction. Without this, the interaction will show as failed.
 * https://discord.com/developers/docs/interactions/slash-commands#interaction-response-object-interaction-callback-type
 */
const makeInteractionCallback = (
  id: string,
  token: string,
  content: string
) => {
  try {
    superagent
      .post(`https://discord.com/api/v8/interactions/${id}/${token}/callback`)
      .type('application/json')
      .set('Authorization', `Bot ${APP_TOKEN}`)
      .send({
        type: 4,
        data: {
          content,
        },
      })
      .catch((err) => {
        p(err);
      });
  } catch (err) {
    p(err);
  }
};

/**
 * Catches all interactions (slash commands) for the bot.
 * This is how the bot is controlled.
 */
client.ws.on('INTERACTION_CREATE' as any, async (interaction) => {
  try {
    client.users
      .fetch(interaction.member.user.id)
      .then((user) => {
        const guild = client.guilds.cache.get(interaction.guild_id);
        const channel = guild?.channels.cache.get(interaction.channel_id);
        const cmd = interaction.data.name.toLowerCase();
        if (OWNER_ID === interaction.member.user.id) {
          const isAdministrator = guild?.me?.hasPermission('ADMINISTRATOR');
          const canSendMessages = guild?.me?.hasPermission('SEND_MESSAGES');
          if (
            isAdministrator &&
            guild &&
            user &&
            channel &&
            channel.type === 'text'
          ) {
            // We got all the permissions we require.
            execCommands(
              guild,
              user,
              cmd,
              user.id === OWNER_ID,
              ROLE_NAME,
              (content) =>
                makeInteractionCallback(
                  interaction.id,
                  interaction.token,
                  content
                )
            );
          } else if (
            canSendMessages &&
            !isAdministrator &&
            channel &&
            channel.type === 'text'
          ) {
            // Inform about the missing permission.
            makeInteractionCallback(
              interaction.id,
              interaction.token,
              "I don't have enough permissions to execute commands. " +
                'Give me administrator privileges.'
            );
          } else {
            // No permissions at all.
            p('Was unable to function. ADMINISTRATOR permission is missing.');
          }
        }
      })
      .catch((err) => {
        p(err);
      });
  } catch (err) {
    p(err);
  }
});

// Login to Discord.
login();
