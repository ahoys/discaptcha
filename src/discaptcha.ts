import DiscordJs, { GuildChannel, Intents } from 'discord.js';
import install from './commands/install';
import uninstall from './commands/uninstall';
import humanize from './commands/humanize';
import verifyme from './commands/verifyme';
import superagent from 'superagent';
import { config } from 'dotenv';
import { p } from 'logscribe';
import { verifyMember } from './handlers/handler.verifyMember';

// Load custom configurations.
config({ path: __dirname + '/.env' });
const APP_TOKEN = process.env.APP_TOKEN ?? '';
const APP_ID = process.env.APP_ID ?? '';
const OWNER_ID = process.env.OWNER_ID ?? '';
const OWNER_ROLE = process.env.OWNER_ROLE ?? '';
const ROLE_NAME = process.env.ROLE_NAME ?? 'Verified';
p(`Discaptcha is starting for application id ${APP_ID}...`);

// Look for invalid configuration.
// The values here are approximations.
if (
  APP_TOKEN === '' ||
  APP_ID === '' ||
  (OWNER_ID === '' && OWNER_ROLE === '') ||
  ROLE_NAME === ''
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
    name: install.name,
    description: install.description,
  },
  {
    name: uninstall.name,
    description: uninstall.description,
  },
  {
    name: humanize.name,
    description: humanize.description,
  },
  {
    name: verifyme.name,
    description: verifyme.description,
  },
];

/**
 * Posts a response to an interaction.
 * This should be done ASAP after receiving an interaction.
 */
const respondToInteraction = (
  id: string,
  token: string,
  content: string
): Promise<void> =>
  new Promise((resolve, reject) => {
    try {
      superagent
        .post(`https://discord.com/api/v8/interactions/${id}/${token}/callback`)
        .type('application/json')
        .send({
          type: 4,
          data: {
            content,
          },
        })
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });

/**
 * Sends a message to a channel if a text channel.
 */
const sendToTextChannel = (guildChannel: GuildChannel, content: string) => {
  try {
    if (guildChannel.isText() && content.trim() !== '') {
      guildChannel.send(content).catch((err) => p(err));
    }
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
    const id: string = interaction?.id ?? '';
    const token: string = interaction?.token ?? '';
    const requesterId: string = interaction?.member?.user?.id ?? '';
    const requesterRoles: string[] = interaction?.member?.roles ?? [];
    const hasTheRole = OWNER_ROLE !== '' && requesterRoles.includes(OWNER_ROLE);
    const isTheOwner = requesterId === OWNER_ID;
    if (hasTheRole || isTheOwner) {
      client.guilds
        .fetch(interaction?.guild_id ?? '')
        .then((guild) => {
          const channel = guild?.channels.cache.get(interaction?.channel_id);
          if (!guild) {
            p(
              `Unable to find guild "${interaction?.guild_id}". This is unexpected.`
            );
          } else if (!guild.me?.hasPermission('SEND_MESSAGES')) {
            p(
              `Discaptcha can't send messages to guild "${guild.name}". ` +
                'Insufficient privileges to function.'
            );
          } else if (!channel || !channel.isText()) {
            p('Discaptcha commands should be activated on a text channel.');
          } else if (!guild.me?.hasPermission('ADMINISTRATOR')) {
            const content =
              `Discaptcha doesn't have the administrator flag enabled in "${guild.name}". ` +
              'Insufficent privileges to function.';
            respondToInteraction(id, token, content);
            p(content);
          } else {
            // We have all the required privileges. Let's go and
            // trigger the command.
            const cmdName = interaction?.data?.name.toLowerCase();
            if (cmdName === 'install') {
              respondToInteraction(
                id,
                token,
                'Installing Discaptcha... 👷\n\n' +
                  'This may take a while. I will inform you when the work is done.'
              )
                .then(() =>
                  install
                    .execute(guild, ROLE_NAME)
                    .then((content) => sendToTextChannel(channel, content))
                    .catch((content) => sendToTextChannel(channel, content))
                )
                .catch((err) => p(err));
            } else if (cmdName === 'humanize') {
              respondToInteraction(
                id,
                token,
                'Humanizing this server... 🧍\n\n' +
                  'This may take a while. I will inform you when the work is done.'
              )
                .then(() =>
                  humanize
                    .execute(guild, ROLE_NAME)
                    .then((content) => sendToTextChannel(channel, content))
                    .catch((content) => sendToTextChannel(channel, content))
                )
                .catch((err) => p(err));
            } else if (cmdName === 'uninstall') {
              respondToInteraction(
                id,
                token,
                'Uninstalling Discaptcha... 💣\n\n' +
                  'This may take a while. I will inform you when finished.'
              )
                .then(() =>
                  uninstall
                    .execute(guild, ROLE_NAME)
                    .then((content) => sendToTextChannel(channel, content))
                    .catch((content) => sendToTextChannel(channel, content))
                )
                .catch((err) => p(err));
            } else if (cmdName === 'verifyme') {
              respondToInteraction(id, token, 'I sent you a private message.')
                .then(() =>
                  verifyme
                    .execute(guild, ROLE_NAME, requesterId)
                    .then((content) => sendToTextChannel(channel, content))
                    .catch((content) => sendToTextChannel(channel, content))
                )
                .catch((err) => p(err));
            }
          }
        })
        .catch((err) => {
          p('Unable to find the guild.', err);
        });
    } else {
      const userId = interaction?.user?.id;
      const username = interaction?.user?.username;
      if (userId) {
        p(`An invalid interaction attempt from user: ${userId} (${username}).`);
      }
    }
  } catch (err) {
    p(err);
  }
});

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
