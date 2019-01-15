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
    log(
      `${configPath} is not correctly constructed. See readme for steps to properly create the config.json.`
    );
    hasErrors = true;
  }
} else {
  log(
    `${configPath} not found. The file is necessary for initializing the bot.`
  );
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
    log(
      `${authPath} is not correctly constructed. See readme for steps to properly create the auth.json.`
    );
    hasErrors = true;
  }
} else {
  log(
    `${authPath} not found. The file is necessary for connecting the bot. See readme for more info.`
  );
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
const Client = new Discord.Client(config.clientOptions);
const reconnectTime = 10000;
let reconnectTimeout;

/**
 * on.ready
 * Triggers when the Client is ready to act,
 * i.e. connected.
 */
Client.on('ready', () => {
  log(
    'Successfully connected to Discord 👏.\n' +
      `Username: ${Client.user.username}\n` +
      `Id: ${Client.user.id}\n` +
      `Verified: ${Client.user.verified}\n` +
      'Waiting for events...'
  );
});

/**
 * on.message
 * Triggers every time the bot sees a new message.
 */
Client.on('message', Message => {
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
      messageUtil.hasPermission(
        Message,
        commands[c.command].permissions,
        config.moderators,
        auth.owner
      )
    ) {
      const command = commands[c.command];
      log(`${Message.author.username} triggered ${c.command}.`);
      if (command.mustVerify) {
        // This command requires verifying.
        const cmd = () => command.execute(Client, Message, c.value);
        verifyUtil.verifyCommand(Message, command.verifyMessage, cmd);
      } else {
        // This command does not require verifying.
        command.execute(Client, Message, c.value);
      }
    }
  }
});

/**
 * on.guildMemberAdd
 * Triggers every time a new client joins the server (guild).
 */
Client.on('guildMemberAdd', GuildMember => {
  verifyUtil.verifyClient(GuildMember);
});

/**
 * on.reconnecting
 * Triggered when Discord.js tries to reconnect after lost of
 * Discord-connection.
 */
Client.on('reconnecting', () => {
  log('Lost connection. Attempting to reconnect...');
});

/**
 * on.error
 * Emitted whenever the client's WebSocket encounters a connection error.
 */
Client.on('error', () => {
  log(
    `Discord.js websocket encountered a connection error.
        Attempting to reconnect in ${reconnectTime / 1000} seconds.`
  );
  clearTimeout(reconnectTimeout);
  reconnectTimeout = setTimeout(() => {
    Client.login(auth.token);
  }, reconnectTime);
});

// Here we go!
Client.login(auth.token);
