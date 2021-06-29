import DiscordJs, { Intents, TextChannel } from 'discord.js';
import superagent from 'superagent';
import { config } from 'dotenv';
import { p } from 'logscribe';
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
 * This is the main event as we are required to
 * verify member's "humanity".
 */
Client.on('guildMemberAdd', (GuildMember) => {
  try {
    verifyMember(GuildMember, roleName)
      .then((msg) => p(msg))
      .catch((err) => p(err));
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
 */
Client.ws.on('INTERACTION_CREATE' as any, async (interaction) => {
  try {
    Client.users
      .fetch(interaction.member.user.id)
      .then((user) => {
        const guild = Client.guilds.cache.get(interaction.guild_id);
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
              roleName,
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

/**
 * Something went wrong with Discord.
 * Probably Internet related issues.
 */
Client.on('error', () => {
  try {
    login();
  } catch (err) {
    p(err);
  }
});

// Login to Discord.
login();
