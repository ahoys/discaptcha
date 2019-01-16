const log = require('debug')('context.main');
const init = require('./context.init');
let state;

/**
 * Returns getters of a store by id.
 * @param {string} name - Store's name.
 */
const getStore = name => {
  if (state.has(name)) {
    const getters = state.getIn([name, 'getters']);
    const result = {};
    // We give an up-to-date store state object to go with the
    // requests.
    Object.keys(getters).forEach(gK => {
      result[gK] = queries => {
        return getters[gK](state.getIn([name, 'state']), queries);
      };
    });
    return result;
  }
  return {};
};

/**
 * Dispatchs a payload to all setters that match the key.
 * @param {string} key - Setter's name.
 * @param {*} payload - Custom payload.
 */
const dispatch = (key, payload) => {
  // Look for all stores that have the requested reducer.
  const filtered = state.filter(s => s.hasIn(['setters', key]));
  filtered.forEach(store => {
    // Get a new state for the store by processing the payload
    // with the reducer.
    const setter = store.getIn(['setters', key]);
    const udpStore = store.set('state', setter(store.get('state'), payload));
    // Save the payload to the application state.
    state = state.set(store.get('name'), udpStore);
  });
};

/**
 * Initializes the application's stores and
 * returns context.
 * @param {Immutable.Map} overrideStores - Default store if any.
 */
const getContext = overrideStores => {
  try {
    state = init.readStores(overrideStores);
    return {
      getStore,
      dispatch,
    };
  } catch (e) {
    log(e);
  }
};

module.exports = { getContext, getStore, dispatch };
