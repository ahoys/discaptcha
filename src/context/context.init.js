const log = require('debug')('context.initial');
const { Map } = require('immutable');

/**
 * Validates and returns stores.
 */
const getValidatedStores = stores => {
  try {
    let initialState = new Map({});
    const type = typeof initialState;
    stores.forEach(store => {
      if (
        typeof store === type &&
        store.has('name') &&
        store.has('setters') &&
        store.has('getters') &&
        store.has('state') &&
        typeof store.get('name') === 'string' &&
        typeof store.get('setters') === 'object' &&
        typeof store.get('getters') === 'object' &&
        typeof store.get('state') === type &&
        store.get('name').trim() !== ''
      ) {
        // Everything found, the store can be used.
        initialState = initialState.set(store.get('name'), store);
      } else {
        // The store has unsolved issues.
        if (
          typeof store.get('name') === 'string' &&
          store.get('name').trim() !== ''
        ) {
          log(`Store "${store.get('name')}" is invalid and cannot be loaded.`);
        } else {
          log('Could not load an unknown store.');
        }
      }
    });
    return initialState;
  } catch (e) {
    log(e);
  }
};

/**
 * Initializes and validates initial application state.
 * @param {Immutable.Map} overrideStores - Overriding stores if any.
 */
const readStores = overrideStores => {
  try {
    if (overrideStores && typeof overrideStores === typeof new Map({})) {
      // In case you want to test context.main or something.
      return overrideStores;
    }
    return getValidatedStores([require('./stores/store.guilds')]);
  } catch (e) {
    log(e);
  }
};

module.exports = { readStores, getValidatedStores };
