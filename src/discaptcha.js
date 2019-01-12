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
  Client.on('guildMemberAdd', (GuildMember) => {
    verifyUtil.verifyClient(GuildMember);
  });
});

/**
 * Gives the verified role to everyone.
 * @param {*} Guild 
 */
const verifyAll = (Guild) => {
  const { role } = config.captcha.typeEmoji;
  const { roles, members } = Guild;
  const requestedRole = roles.find(r => String(r.id) === String(role));
  if (requestedRole) {
    log(`Giving roles to everyone in ${Guild.id}...`);
    const membersArr = members.array();
    const size = membersArr.length;
    let i = 0;
    const addRole = (member) => {
      member.addRole(requestedRole, 'Verified human')
        .then(() => {
          i += 1;
          if (size > i) {
            addRole(membersArr[i]);
          } else {
            log(`Verified ${i} clients.`);
          }
        });
    };
    addRole(membersArr[i]);
  }
};

/**
 * Prints all available roles.
 */
printRoles = (Message) => {
  const { guild } = Message;
  const { roles } = guild;
  let msg = '', i = 0;
  roles.forEach((role) => {
    if (i === 0) {
      msg += `${role.name}: ${role.id}`;
    } else {
      msg += `, ${role.name}: ${role.id}`;
    }
    i += 1;
  });
  msg = msg.replace(/\@/g, '');
  log(msg);
  Message.reply(msg);
}

/**
 * Finds those who don't have the verified role.
 */
printMissingRoles = (Message) => {
  const { role } = config.captcha.typeEmoji;
  const { guild } = Message;
  const { roles, members } = guild;
  const requestedRole = roles.find(r => String(r.id) === String(role));
  let missing;
  if (requestedRole) {
    missing = members.filter(m => {
      const result = m.roles.find(r => r.id === requestedRole.id);
      return result === null;
    });
  }
  if (missing && missing.size) {
    let i = 0;
    let msg = '';
    missing.forEach((member) => {
      if (i === 0) {
        msg += `${member.user.username}`;
      } else {
        msg += `, ${member.user.username}`;
      }
      i += 1;
    });
    Message.reply(`The following clients do not have the role: ${msg}`);
    Message.reply('Maybe you should try command "verify all"?');
  } else {
    Message.reply('Everyone got the role.');
  }
}

/**
 * Grants a role to a specific member.
 * @param {*} GuildMember 
 */
const grantRole = (GuildMember) => {
  const { role } = config.captcha.typeEmoji;
  const { guild } = GuildMember;
  const requestedRole = guild.roles.find(r => String(r.id) === String(role));
  if (requestedRole) {
    GuildMember.addRole(requestedRole, 'Verified human')
      .then(() => {
        log(`Role ${role} set.`);
      })
      .catch(e => log(e));
  }
};

/**
 * Creates a DM captcha.
 * @param {*} GuildMember 
 */
const createDM = (GuildMember) => {
  const { user } = GuildMember;
  const userId = user.id;
  user.createDM()
  .then((DMChannel) => {
    DMChannel.send(config.captcha.typeEmoji.message)
      .then((Message) => {
        Message.react(config.captcha.typeEmoji.emoji)
          .then(() => {
            log(`Waiting for ${userId} verification...`);
            const filter = (reaction, rUser) => reaction.emoji.name === config.captcha.typeEmoji.emoji && rUser.id === userId;
            const collector = Message.createReactionCollector(filter, { time: 10000 });
            collector.on('collect', (r) => {
              log(`Verified ${userId}.`);
              DMChannel.send(config.captcha.typeEmoji.verificationMessage);
              grantRole(GuildMember);
            });
          });
      });
  });
};

/**
 * Emitted whenever a user joins a guild.
 */
// Client.on('guildMemberAdd', (GuildMember) => {
//   createDM(GuildMember);
// });

/**
 * Emitted whenever a message arrives.
 * Used basically only for the owner commands.
 */
// Client.on('message', (Message) => {
//   const { author, content, member } = Message;
//   if (Message.isMentioned(Client.user.id) && author.id === auth.owner) {
//     // Owner is speaking to me!
//     if (content.includes('test me')) {
//       log('The owner triggered "test me".');
//       createDM(member);
//     } else if (content.includes('verify all')) {
//       log('The owner triggered "verify all".');
//       verifyAll(Message.guild);
//     } else if (content.includes('kill')) {
//       log('The owner triggered "kill".');
//       process.exit(1);
//     } else if (content.includes('print roles')) {
//       log('The owner triggered "print roles".');
//       printRoles(Message);
//     } else if (content.includes('print unverified')) {
//       log('The owner triggered "print unverified".');
//       printMissingRoles(Message);
//     }
//   }
// });
