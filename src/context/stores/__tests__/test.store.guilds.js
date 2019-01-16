const guildsStore = require('../store.guilds');
const { Map, List } = require('immutable');

const fakeState = new Map({
  guilds: new Map({
    1234: new Map({
      commandKeys: new List(['exampleCommand']),
    }),
  }),
});

test('A command is reserved by a guild.', () => {
  const map = guildsStore.get('getters');
  const fnc = map.isReservedCommand;
  const payload = {
    guildId: '1234',
    commandKey: 'exampleCommand',
  };
  expect(fnc(fakeState, payload)).toBe(true);
});

test('A command is not reserved by a guild.', () => {
  const map = guildsStore.get('getters');
  const fnc = map.isReservedCommand;
  const payload = {
    guildId: '1234',
    commandKey: 'notReserved',
  };
  expect(fnc(fakeState, payload)).toBe(false);
});

test('Undefined guild has no reserves.', () => {
  const map = guildsStore.get('getters');
  const fnc = map.isReservedCommand;
  const payload = {
    guildId: '4321',
    commandKey: 'exampleCommand',
  };
  expect(fnc(fakeState, payload)).toBe(false);
});

test('Adding a new command to reserved.', () => {
  const map = guildsStore.get('setters');
  const fnc = map.reserveCommand;
  const payload = {
    guildId: '1234',
    commandKey: 'newCommand',
  };
  const newState = fnc(fakeState, payload);
  const commandKeys = newState.getIn([
    'guilds',
    payload.guildId,
    'commandKeys',
  ]);
  expect(commandKeys.includes(payload.commandKey)).toBe(true);
});

test('Releasing a command.', () => {
  const map = guildsStore.get('setters');
  const fnc = map.releaseCommand;
  const payload = {
    guildId: '1234',
    commandKey: 'exampleCommand',
  };
  const newState = fnc(fakeState, payload);
  const commandKeys = newState.getIn([
    'guilds',
    payload.guildId,
    'commandKeys',
  ]);
  expect(commandKeys.includes(payload.commandKey)).toBe(false);
});
