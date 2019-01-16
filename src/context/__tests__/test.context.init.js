const init = require('../context.init');
const { Map, List } = require('immutable');

const stores = new List([
  new Map({
    name: 'GuildsStore',
    setters: {},
    getters: {},
    state: new Map({}),
  }),
  new Map({
    name: 'TestsStore',
    setters: {},
    getters: {},
    state: new Map({}),
  }),
]);

const missingState = new List([
  new Map({
    name: 'GuildsStore',
    setters: {},
    getters: {},
  }),
]);

test('Store names and initial keys match.', () => {
  const keys = init.getValidatedStores(stores).toJS();
  expect(Object.keys(keys)).toEqual(['GuildsStore', 'TestsStore']);
});

test('Invalid store missing state is not registered.', () => {
  const keys = init.getValidatedStores(missingState).toJS();
  expect(Object.keys(keys)).toEqual([]);
});
