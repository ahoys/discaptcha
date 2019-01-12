const debug = require('debug');
const path = require('path');
const fs = require('fs');
const log = debug('root');

// Enable debug everywhere.
debug.enable('*');
log('Starting Discaptcha...');

let auth, config;
let hasErrors = false;
const configPath = path.resolve('./configs/config.json');
const authPath = path.resolve('./configs/auth.json');

// Read configs.
if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (
    typeof config !== 'object' ||
    typeof config.clientOptions !== 'object' ||
    typeof config.timeToVerifyInMs !== 'number' ||
    typeof config.guilds !== 'object'
  ) {
    log(`${configPath} is not correctly constructed. See readme for steps to properly create the config.json.`);
    hasErrors = true;
  }
} else {
  log(`${configPath} not found. The file is necessary for initializing the bot.`);
  hasErrors = true;
}

// Read auth.
if (fs.existsSync(authPath)) {
  auth = JSON.parse(fs.readFileSync(authPath, 'utf8'));
  if (
    typeof auth !== 'object' ||
    typeof auth.token !== 'string' ||
    typeof auth.id !== 'string' ||
    typeof auth.owner !== 'string'
  ) {
    log(`${authPath} is not correctly constructed. See readme for steps to properly create the auth.json.`);
    hasErrors = true;
  }
} else {
  log(`${authPath} not found. The file is necessary for connecting the bot. See readme for more info.`);
  hasErrors = true;
}

// If the basic requirements fail, we cannot proceed.
if (hasErrors) {
  log('The bot cannot be started.');
  process.exit(1);
}

// Time to connect Discord!
const commands = require('./commands/index');
const commandKeys = Object.keys(commands);
const messageUtil = require('./utilities/util.message');
const verifyUtil = require('./utilities/util.verify');
const Discord = require('discord.js');

// Login to Discord.
const Client = new Discord.Client(config.clientOptions);
Client.login(auth.token)
  .catch((e) => {
    log('Failed to connect.', e);
  });

/**
 * Emitted When the Client is ready for action.
 */
Client.on('ready', () => {
  log('Successfully connected to Discord!');
  log(`Username: ${Client.user.username}, id: ${Client.user.id}, verified: ${Client.user.verified}.`);
  log('Waiting for events...');

  /**
   * on.message
   * Triggers every time the bot sees a new message.
   */
  Client.on('message', (Message) => {
    if (
      // Make sure the bot is mentioned.
      Message.isMentioned(Client.user.id)
    ) {
      const c = messageUtil.readCommand(Message);
      if (
        // Guild is required.
        Message.guild &&
        // Make sure the message contains a valid command.
        commandKeys.includes(c.command) &&
        // Make sure the client has the required permission.
        messageUtil.hasPermission(Message, commands[c.command].permissions, config.moderators, auth.owner)
      ) {
        const command = commands[c.command];
        log(`${Message.author.username} triggered ${c.command}.`);
        if (command.mustVerify) {
          // This command requires verifying.
          const cmd = () => command.execute(Client, Message);
          verifyUtil.verifyCommand(Message, command.verifyMessage, cmd);
        } else {
          // This command does not require verifying.
          command.execute(Client, Message);
        }
      }
    }
  });

  /**
   * on.guildMemberAdd
   * Triggers every time a new client joins the server (guild).
   */
  Client.on('guildMemberAdd', (GuildMember) => {
    verifyUtil.verifyClient(GuildMember);
  });
});
