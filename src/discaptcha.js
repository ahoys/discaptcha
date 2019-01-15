/**
 * Author: Ari Höysniemi
 * Date: 01/2019
 * License: MIT
 */
const cluster = require('cluster');
const debug = require('debug');
const log = debug('root');
debug.enable('*');

/**
 * Discaptcha starts here.
 *
 * This application is clustered, meaning that
 * there are multiple threads serving different purposes.
 *
 * Master: monitors the application's state.
 * Worker: runs the bot.
 */
if (cluster.isMaster) {
  // Master Thread
  // To keep the app alive, we have a master thread
  // that makes sure the app bounces back if it crashes.
  let crashStamps = [];
  let rebootTimer;
  cluster.fork();
  cluster.on('exit', (worker, code, signal) => {
    // Why it crashed (on purpose?).
    const flag = code === undefined ? signal : code;
    if (flag === 1) {
      // Unexpected exit.
      log(
        `The process has crashed.\n` +
          `pid: ${worker.process.pid}\n` +
          `code: ${code}\n` +
          `signal: ${signal}`
      );
      const len = crashStamps.length;
      crashStamps.push(new Date().getTime());
      if (len === 0 || crashStamps[len] - crashStamps[len - 1] > 10000) {
        // Over ten seconds has passed since the last crash, meaning that
        // the app probably isn't in a circle of death.
        log('Rebooting in 1 seconds...');
        clearTimeout(rebootTimer);
        rebootTimer = setTimeout(() => {
          cluster.fork();
        }, 1000);
        // Clear the buffer now and then.
        if (len > 128) {
          crashStamps = [];
        }
      } else {
        // Circle of death.
        // We have failed.
      }
    } else if (flag === 2) {
      // Controller exit.
      log('Goodbye!');
    } else if (flag === 3) {
      // Controlled reboot.
      log('Rebooting in 5 seconds...');
      clearTimeout(rebootTimer);
      rebootTimer = setTimeout(() => {
        cluster.fork();
      }, 5000);
    } else {
      // Unknown crash.
      // We have failed, this should not happen.
      log(
        `The process has crashed and cannot recover.\n` +
          `pid: ${worker.process.pid}\n` +
          `code: ${code}\n` +
          `signal: ${signal}`
      );
    }
  });
} else {
  // Worker Thread
  // The actual Discord bot is located here in the worker
  // thread.
  log('Starting Discaptcha...');

  // Get and validate authentication.
  const authUtil = require('./utilities/util.auth');
  const auth = authUtil.getAuth();
  if (!auth) {
    log('Invalid auth.');
    process.exit(1);
  }

  // Get and validate configs.
  const configUtil = require('./utilities/util.config');
  const config = configUtil.getConfig();
  if (!config) {
    log('Invalid config.');
    process.exit(1);
  }

  // We are now ready to setup Discord.js and
  // connect Discord.
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
}
