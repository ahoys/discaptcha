module.exports = {
  botify: {
    // The actual functionality.
    execute: require('./command.botify'),
    // A description that is used in help commands.
    description: 'Removes the defined verification role from everybody. This is usually needed when the verification role has changed or you are about to remove the bot.',
    // Permissions required for the command.
    permissions: {
      owner: true, // Guild owner.
      moderator: true, // Guild moderator role.
    },
    // Whether the command must be verified
    // before it is executed.
    mustVerify: true,
    // A message that is sent to verify the command.
    verifyMessage: 'Are you sure? This may prevent the users from speaking.',
  },
  exit: {
    execute: require('./command.exit'),
    description: 'Kills the bot. The bot must be manually restarted.',
    permissions: {
      owner: false,
      moderator: false,
    },
    mustVerify: true,
    verifyMessage: 'Are you sure? The registered guilds can no longer verify their clients.',
  },
  help: {
    execute: require('./command.help'),
    description: 'Lists all the available commands.',
    permissions: {
      owner: true,
      moderator: true,
    },
    mustVerify: false,
    verifyMessage: '',
  },
  humanize: {
    execute: require('./command.humanize'),
    description: 'Verifies everyone without a captcha check. This is usually needed when the bot joins a server for the first time.',
    permissions: {
      owner: true,
      moderator: true,
    },
    mustVerify: true,
    verifyMessage: 'Are you sure? This can give unwanted permissions to bots.',
  },
  // TODO: requires a robust solution to kick everyone. See utilities/util.guild.
  // kick: {
  //   execute: require('./command.kick'),
  //   description: 'Kicks everyone who do not have the verification role set.',
  //   permissions: {
  //     owner: true,
  //     moderator: true,
  //   },
  //   mustVerify: true,
  //   verifyMessage: 'Are you sure? This will kick unverified human clients too.',
  // },
  leave: {
    execute: require('./command.leave'),
    description: 'Makes the bot leave the server.',
    permissions: {
      owner: true,
      moderator: true,
    },
    mustVerify: true,
    verifyMessage: 'Are you sure? All your settings will be lost. Make sure to remove the verified roles first with the "botify" command.',
  },
  moderators: {
    execute: require('./command.moderators'),
    description: 'Replies with the current moderator role. You can set the role by adding the role id after the command.\n\nExample 1: moderators\nExample 2: moderators 123456789.',
    permissions: {
      owner: true,
      moderator: false,
    },
    mustVerify: false,
    verifyMessage: '',
  },
  // TODO: requires Node clusters.
  // restart: {
  //   execute: require('./command.restart'),
  //   description: 'Restarts the bot.',
  //   permissions: {
  //     owner: false,
  //     moderator: false,
  //   },
  //   mustVerify: true,
  //   verifyMessage: 'Are you sure? This will cause some of the on-going verifications to fail.',
  // },
  role: {
    execute: require('./command.role'),
    description: 'Replies with the current verification role. You can set the role by adding the role id after the command.\n\nExample 1: role\nExample 2: role 123456789.',
    permissions: {
      owner: true,
      moderator: true,
    },
    mustVerify: false,
    verifyMessage: '',
  },
  roles: {
    execute: require('./command.roles'),
    description: 'Replies with a list of available roles and ids. Useful for finding the id of the verification role.',
    permissions: {
      owner: true,
      moderator: true,
    },
    mustVerify: false,
    verifyMessage: '',
  },
  testme: {
    execute: require('./command.testme'),
    description: 'Makes a captcha check for the client who requested the command.',
    permissions: {
      owner: true,
      moderator: true,
    },
    mustVerify: false,
    verifyMessage: '',
  },
  unverified: {
    execute: require('./command.unverified'),
    description: 'Lists all clients who are not verified.',
    permissions: {
      owner: true,
      moderator: true,
    },
    mustVerify: false,
    verifyMessage: '',
  },
  verified: {
    execute: require('./command.verified'),
    description: 'Lists all clients who are verified.',
    permissions: {
      owner: true,
      moderator: true,
    },
    mustVerify: false,
    verifyMessage: '',
  },
}
