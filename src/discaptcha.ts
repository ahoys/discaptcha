import DiscordJs, { Intents } from 'discord.js';
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
p(`Discaptcha is starting for application id ${APP_ID}...`);

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
  p(`Succesfully connected to Discord as ${client.user?.username}.`);
  p('Discaptcha is ready.');
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

// A suitable command object for the Discord API.
interface ICommand {
  [key: string]: string | boolean | undefined;
  name: string;
  description: string;
  default_permission?: boolean;
}

// Discord API command response.
interface IApplicationCommandStructure {
  [key: string]: string | boolean | undefined;
  id: string;
  application_id: string;
  guild_id?: string;
  name: string;
  description: string;
  default_permission?: boolean;
}

// The currently usable commands.
const commands: ICommand[] = [
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

/**
 * Creates a new global interaction command for the bot.
 * Used to register slash commands with the Discord API.
 */
const createCommand = (data: ICommand): Promise<void> =>
  new Promise((resolve, reject) => {
    try {
      superagent
        .post(`https://discord.com/api/v8/applications/${APP_ID}/commands`)
        .type('application/json')
        .set('Authorization', `Bot ${APP_TOKEN}`)
        .send(data)
        .then(() => {
          p('Registered a new slash command:', data.name);
          resolve();
        })
        .catch((err) => {
          p(err);
          reject();
        });
    } catch (err) {
      p(err);
      reject();
    }
  });

/**
 * Updates an existing interaction command.
 * Used to update deprecated data of a command.
 */
const updateCommand = (data: ICommand, id: string): Promise<void> =>
  new Promise((resolve, reject) => {
    try {
      superagent
        .patch(
          `https://discord.com/api/v8/applications/${APP_ID}/commands/${id}`
        )
        .type('application/json')
        .set('Authorization', `Bot ${APP_TOKEN}`)
        .send(data)
        .then(() => {
          p('Updated an out-of-date slash command.');
          resolve();
        })
        .catch((err) => {
          p(err);
          reject();
        });
    } catch (err) {
      p(err);
      reject();
    }
  });

/**
 * Removes an interaction command.
 * Used to remove deprecated slash commands from Discord API.
 */
const removeCommand = (id: string): Promise<void> =>
  new Promise((resolve, reject) => {
    try {
      superagent
        .delete(
          `https://discord.com/api/v8/applications/${APP_ID}/commands/${id}`
        )
        .type('application/json')
        .set('Authorization', `Bot ${APP_TOKEN}`)
        .then(() => {
          p('Removed a deprecated slash command.');
          resolve();
        })
        .catch((err) => {
          p(err);
          reject();
        });
    } catch (err) {
      p(err);
      reject();
    }
  });

/**
 * Verifies that all interaction commands are up-to-date.
 * Missing ones are created, invalid are updated and deprecated removed.
 */
const verifyCommands = (): Promise<void> =>
  new Promise((resolve, reject) => {
    try {
      p('Verifying commands...');
      superagent
        .get(`https://discord.com/api/v8/applications/${APP_ID}/commands`)
        .type('application/json')
        .set('Authorization', `Bot ${APP_TOKEN}`)
        .then((res) => {
          const body = res?.body as IApplicationCommandStructure[];
          if (typeof body === 'object') {
            const promises: Promise<void>[] = [];
            // The current commands in the Discord API by name.
            const existing = body.map((command) => command.name);
            const shouldBeExisting = commands.map((command) => command.name);
            // Missing commands.
            const missing = commands.filter(
              (command) => !existing.includes(command.name)
            );
            // Registered commands (may be outdated).
            const registered = commands.filter((command) =>
              existing.includes(command.name)
            );
            // Deprecated that have been removed.
            const extra = body.filter(
              (command) =>
                typeof command.id === 'string' &&
                typeof command.name === 'string' &&
                !shouldBeExisting.includes(command.name)
            );
            // First, let's add the missing commands.
            missing.forEach((command) => {
              promises.push(createCommand(command));
            });
            // Then make sure the existing commands are valid.
            registered.forEach((command) => {
              const registeredTarget = body.find(
                (bodyCommand) => bodyCommand.name === command.name
              );
              if (
                registeredTarget &&
                Object.keys(command).some(
                  (key: string) => command[key] !== registeredTarget[key]
                )
              ) {
                promises.push(updateCommand(command, registeredTarget.id));
              }
            });
            // Finally we remove the extra commands.
            extra.forEach((command) => {
              promises.push(removeCommand(command.id));
            });
            // Continue when done.
            Promise.all(promises)
              .then(() => {
                p('All commands verified.');
                resolve();
              })
              .catch(() => {
                reject();
              });
          } else {
            p('Discord API gave an invalid response. Missing body.');
            reject();
          }
        })
        .catch((err) => {
          p(err);
          reject();
        });
    } catch (err) {
      p(err);
      reject();
    }
  });

// Start the "engine" and login to Discord.
verifyCommands()
  .then(() => {
    login();
  })
  .catch(() => {
    throw new Error(
      'Was unable to verify slash commands. ' +
        'Connection issues or perhaps the Discord API has changed? ' +
        'Look for Discaptcha updates.'
    );
  });
