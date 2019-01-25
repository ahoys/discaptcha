const { lp } = require('logscribe').default('command.leave', '\x1b[32m');

/**
 * Makes the bot leave the server.
 */
module.exports = (Client, Message, value = '') => {
  try {
    if (
      Message &&
      Message.guild &&
      Message.guild.name &&
      Message.author &&
      Message.author.username
    ) {
      const User = Message.author;
      User.createDM().then(DMChannel => {
        DMChannel.send(
          `Thank you for having me ${User.username}!\n\n` +
            'If you had any issues with the bot, please leave a note here: ' +
            'https://github.com/ahoys/discaptcha/issues'
        ).then(() => {
          const Guild = Message.guild;
          Guild.leave().then(() => {
            lp(`User ${User.username} asked me to leave ${Guild.name}.`);
          });
        });
      });
    }
  } catch (e) {
    lp(e);
  }
};
