const guildUtil = require('../util.guild');

const User = {
  id: '1234567890',
  username: 'Example Guy',
};

const GuildMemberThatResolves = {
  id: '1234567890',
  kickable: true,
  kick: () => {
    return new Promise(resolve => {
      resolve();
    });
  },
  user: User,
  addRole: () => {
    return new Promise(resolve => {
      resolve();
    });
  },
  removeRole: () => {
    return new Promise(resolve => {
      resolve();
    });
  },
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
  addRole: () => {
    return new Promise((resolve, reject) => {
      reject();
    });
  },
  removeRole: () => {
    return new Promise((resolve, reject) => {
      reject();
    });
  },
};

const reason = 'Just Testing.';
const resolveStr = `Kicked ${User.username}: ${reason}`;

test('Return string when the kick is successful.', () => {
  expect.assertions(1);
  return guildUtil
    .kickGuildMember(GuildMemberThatResolves, reason)
    .then(resolve => {
      expect(resolve).toBe(resolveStr);
    });
});

test('We catch an exception on kick rejection.', () => {
  expect.assertions(1);
  return guildUtil.kickGuildMember(GuildMemberThatRejects, reason).catch(e => {
    expect(e).toBe('error');
  });
});

test('Add a role to members, return success count.', () => {
  expect.assertions(1);
  return guildUtil
    .adjustRoleOfMembers(
      true,
      {},
      {
        '0': GuildMemberThatResolves,
        '1': GuildMemberThatResolves,
        array: () => {
          return [GuildMemberThatResolves, GuildMemberThatResolves];
        },
      },
      reason
    )
    .then(resolve => {
      expect(resolve).toBe(2);
    });
});

test('Remove a role from members, return success count.', () => {
  expect.assertions(1);
  return guildUtil
    .adjustRoleOfMembers(
      false,
      {},
      {
        '0': GuildMemberThatResolves,
        '1': GuildMemberThatResolves,
        array: () => {
          return [GuildMemberThatResolves, GuildMemberThatResolves];
        },
      },
      reason
    )
    .then(resolve => {
      expect(resolve).toBe(2);
    });
});

test('Return a valid verification role for a guild.', () => {
  const Guild = {
    id: 'test',
    roles: [
      {
        id: '1234',
      },
    ],
  };
  expect(guildUtil.getVerificationRoleOfGuild(Guild)).toEqual({ id: '1234' });
});
