const guildUtil = require('../util.guild');

const User = {
  id: '1234567890',
  username: 'Example Guy',
};

const GuildMemberThatResolves = {
  id: '1234567890',
  kickable: true,
  kick: () => {
    return new Promise((resolve) => {
      resolve();
    });
  },
  user: User,
};

const GuildMemberThatRejects = {
  id: '1234567890',
  kickable: true,
  kick: () => {
    return new Promise((resolve, reject) => {
      reject('error');
    });
  },
  user: User,
};

const reason = 'Just Testing.';
const resolveStr = `Kicked ${User.username}: ${reason}`

test('Return string when the kick is successful.', () => {
  expect.assertions(1);
  return guildUtil
    .kickGuildMember(GuildMemberThatResolves, reason)
    .then((resolve) => {
      expect(resolve).toBe(resolveStr);
    });
});

test('We catch an exception on kick rejection.', () => {
  expect.assertions(1);
  return guildUtil
    .kickGuildMember(GuildMemberThatRejects, reason)
    .catch((e) => {
      expect(e).toBe('error');
    });
});
