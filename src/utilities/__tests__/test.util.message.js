const messageUtil = require('../util.message');

const Message = {
  content: '@tester moderator 100',
  guild: {
    owner: {
      id: '1000',
    },
  },
  member: {
    roles: [{ id: '100' }, { id: 'some_other' }],
  },
  author: {
    id: '1',
  },
};

test('readCommand exists.', () => {
  expect(typeof messageUtil.readCommand).toBe('function');
});

test('hasPermission exists.', () => {
  expect(typeof messageUtil.readCommand).toBe('function');
});

test('readCommand returns a command object.', () => {
  const result = messageUtil.readCommand(Message);
  expect(typeof result).toBe('object');
  expect(typeof result.mention).toBe('string');
  expect(typeof result.command).toBe('string');
  expect(typeof result.value).toBe('string');
  expect(result.mention).toBe('@tester');
  expect(result.command).toBe('moderator');
  expect(result.value).toBe('100');
});

test('hasPermission returns false as no permissions.', () => {
  const permissions = { owner: false, moderator: false };
  const result = messageUtil.hasPermission(Message, permissions, 100, 0);
  expect(typeof result).toBe('boolean');
  expect(result).toBe(false);
});

test('hasPermission returns true on guild owner permission.', () => {
  const permissions = { owner: true, moderator: false };
  const result = messageUtil.hasPermission(Message, permissions, 0, 1);
  expect(typeof result).toBe('boolean');
  expect(result).toBe(true);
});

test('hasPermission returns true on moderator permission.', () => {
  const permissions = { owner: false, moderator: true };
  const result = messageUtil.hasPermission(Message, permissions, 100, 0);
  expect(typeof result).toBe('boolean');
  expect(result).toBe(true);
});

test('hasPermission returns true on bot owner permission.', () => {
  const permissions = { owner: false, moderator: false };
  const result = messageUtil.hasPermission(Message, permissions, 23, 1);
  expect(typeof result).toBe('boolean');
  expect(result).toBe(true);
});

test('isGuildSpamming and Guild is spamming.', () => {
  messageUtil.isGuildSpamming({ id: '1' }, 1000);
  expect(messageUtil.isGuildSpamming({ id: '1' }, 1000)).toBe(true);
});

test('isGuildSpamming and Guild is not spamming.', () => {
  messageUtil.isGuildSpamming({ id: '2' }, 0);
  expect(messageUtil.isGuildSpamming({ id: '2' }, 0)).toBe(false);
});
