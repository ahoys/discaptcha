const main = require('../context.main');
const { Map } = require('immutable');

const stores = Map({
  GuildsStore: new Map({
    name: 'GuildsStore',
    setters: {},
    getters: {},
    state: new Map({}),
  }),
  TestsStore: new Map({
    name: 'TestsStore',
    setters: {
      setTest: (state, value) => {
        state = state.set('test', value);
        return state;
      },
    },
    getters: {
      getTest: state => {
        return state.get('test');
      },
    },
    state: new Map({
      test: 123,
    }),
  }),
});

test('Context has all the required functions.', () => {
  const keys = Object.keys(main);
  expect(keys.length).toBe(3);
  expect(typeof main.getContext).toBe('function');
  expect(typeof main.getStore).toBe('function');
  expect(typeof main.dispatch).toBe('function');
});

test('getContext returns a valid context.', () => {
  const c = main.getContext();
  expect(Object.keys(c).length).toBe(2);
  expect(typeof c.getStore).toBe('function');
  expect(typeof c.dispatch).toBe('function');
});

test('getStore returns a valid test value.', () => {
  const c = main.getContext(stores);
  const value = c.getStore('TestsStore').getTest();
  expect(value).toBe(123);
});

test('setTest saves a new value.', () => {
  const c = main.getContext(stores);
  c.dispatch('setTest', 321);
  expect(c.getStore('TestsStore').getTest()).toBe(321);
  c.dispatch('setTest', 963);
  expect(c.getStore('TestsStore').getTest()).toBe(963);
  c.dispatch('setTest', 'aku ankka');
  expect(c.getStore('TestsStore').getTest()).toBe('aku ankka');
});
