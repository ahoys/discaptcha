/**
 * Author: Ari Höysniemi
 * Date: 01/2019
 * License: MIT
 */
const cluster = require('cluster');
const { setLogDirPath } = require('logscribe');
const { p, lp } = require('logscribe').default('General');

// Set logs to root.
setLogDirPath('./');

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
      lp(
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
        lp('Rebooting in 1 seconds...');
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
        lp('Circle of death detected. Cannot recover the application.');
      }
    } else if (flag === 2) {
      // Controlled exit.
      p('The process was ordered to shut down.');
    } else if (flag === 3) {
      // Controlled reboot.
      p('Rebooting in 5 seconds...');
      clearTimeout(rebootTimer);
      rebootTimer = setTimeout(() => {
        cluster.fork();
      }, 5000);
    }
  });

  // Ctrl+c event.
  process.on('SIGINT', () => {
    p('Shutting down...');
    // You must exit to switch the exit flag.
    // Otherwise the app may end up into a restarting loop.
    process.exit(0);
  });

  // Something unexpected.
  // This shouldn't be happening.
  process.on('uncaughtException', err => {
    try {
      // Attempt to log the event.
      lp('UncaughtException occurred.', err);
    } catch (e) {
      // Even logging failed, just print the event.
      console.log('Logging failed!');
      console.log(e);
    }
    process.exit(1);
  });
} else {
  // Worker Thread
  // The actual Discord bot is located here in the worker
  // thread.
  p('Starting Discaptcha...');

  // Get and validate authentication.
  const authUtil = require('./utilities/util.auth');
  const auth = authUtil.getAuth();
  if (!auth) {
    lp('Invalid auth.');
    process.exit(1);
  }

  // Get and validate configs.
  const configUtil = require('./utilities/util.config');
  const config = configUtil.getConfig();
  if (!config) {
    lp('Invalid config.');
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
  const reconnectTime = config.reconnectTime;
  let reconnectTimeout;

  /**
   * Log-in to Discord via Discord.js.
   * If the connection fails, try to re-connect.
   */
  const logInDiscord = () => {
    Client.login(auth.token).catch(() => {
      p(
        'Could not connect Discord.' +
          ` Attempting to reconnect in ${reconnectTime / 1000} seconds...`
      );
      clearTimeout(reconnectTimeout);
      reconnectTimeout = setTimeout(() => {
        logInDiscord();
      }, reconnectTime);
    });
  };

  /**
   * on.ready
   * Triggers when the Client is ready to act,
   * i.e. connected.
   */
  Client.on('ready', () => {
    p(
      'Successfully connected to Discord!\n' +
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
        ) &&
        !messageUtil.isGuildSpamming(Message.guild, config.guildSpamLimit)
      ) {
        const command = commands[c.command];
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
   * on.error
   * Emitted whenever the client's WebSocket encounters a connection error.
   */
  Client.on('error', () => {
    // This usually happens when the connection is lost.
    // Only way to recover is to re-login asap.
    logInDiscord();
  });

  // Here we go!
  logInDiscord();
}
