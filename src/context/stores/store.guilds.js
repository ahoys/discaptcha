const { Map, List } = require('immutable');

const setters = {
  /**
   * Reserves a command for a guild.
   * Reserved commands cannot be used.
   */
  reserveCommand: (state, payload) => {
    const { guildId, commandKey } = payload;
    let guild = state.has(guildId) ? state.get(guildId) : new Map({});
    let commandKeys = guild.has('commandKeys')
      ? guild.get('commandKeys')
      : new List([]);
    if (!commandKeys.includes(commandKey)) {
      commandKeys = commandKeys.push(commandKey);
    }
    guild = guild.set('commandKeys', commandKeys);
    state = state.setIn(['guilds', guildId], guild);
    return state;
  },
  /**
   * Releases a reserved command for a guild.
   * The command can now be used.
   */
  releaseCommand: (state, payload) => {
    const { guildId, commandKey } = payload;
    let guild = state.has(guildId) ? state.get(guildId) : new Map({});
    let commandKeys = guild.has('commandKeys')
      ? guild.get('commandKeys')
      : new List([]);
    const i = commandKeys.findIndex(commandKey);
    if (i !== -1) {
      commandKeys = commandKeys.delete(i);
    }
    guild = guild.set('commandKeys', commandKeys);
    state = state.setIn(['guilds', guildId], guild);
    return state;
  },
};

const getters = {
  /**
   * Returns true if the given commandKey is currently
   * reserved.
   */
  isReservedCommand: (state, payload) => {
    const { guildId, commandKey } = payload;
    const guild = state.hasIn(['guilds', guildId])
      ? state.getIn(['guilds', guildId])
      : undefined;
    if (guild) {
      const commandKeys = guild.has('commandKeys')
        ? guild.get('commandKeys')
        : undefined;
      if (commandKeys) {
        return guild.get('commandKeys').includes(commandKey);
      }
      return false;
    }
    return false;
  },
};

const state = new Map({
  guilds: Map({}),
});

module.exports = new Map({
  name: 'GuildsStore',
  setters,
  getters,
  state,
});
