const guildUtil = require('../utilities/util.guild');
const { logscribe } = require('logscribe');
const { lp } = logscribe('command.role');

module.exports = (Client, Message, value = '') => {
  try {
    const Role = guildUtil.getVerificationRoleOfGuild(Message.guild);
    if (Role) {
      Message.reply(
        `The current verification role is \`${Role.name}\`, id \`${Role.id}\`.`
      );
    } else {
      Message.reply(
        'The verification role not set.' +
          'See help for a command on how to set the role.'
      );
    }
  } catch (e) {
    lp(e);
  }
};
