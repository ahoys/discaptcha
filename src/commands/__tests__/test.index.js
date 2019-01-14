const commands = require('../index');
const keys = Object.keys(commands);

keys.forEach(key => {
  const command = commands[key];
  const {
    execute,
    description,
    permissions,
    mustVerify,
    verifyMessage,
  } = command;
  // All commands must have an execution handle.
  test(`${key} has execution handle.`, () => {
    expect(typeof execute).toBe('function');
  });
  // All commands must have a valid description.
  test(`${key} has description.`, () => {
    expect(typeof description).toBe('string');
    expect(description).not.toBe('');
  });
  // All commands must list the permissions.
  test(`${key} has permissions.`, () => {
    expect(typeof permissions.owner).toBe('boolean');
    expect(typeof permissions.moderator).toBe('boolean');
  });
  // All commands must define whether the command requires verification.
  test(`${key} has mustVerify.`, () => {
    expect(typeof mustVerify).toBe('boolean');
  });
  // All commands must define a verifyMessage. It can be empty.
  // If the command requires verification, it must have a verify message.
  test(`${key} has verifyMessage.`, () => {
    expect(typeof verifyMessage).toBe('string');
    if (mustVerify) {
      expect(verifyMessage).not.toBe('');
    }
  });
});
