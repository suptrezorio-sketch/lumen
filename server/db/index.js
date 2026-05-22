const { getSupabase } = require('./supabaseClient');

function loadStore() {
  if (getSupabase()) return require('./supabaseStore');
  return require('./mongoStore');
}

let _store;
function getStore() {
  if (!_store) _store = loadStore();
  return _store;
}

module.exports = new Proxy(
  {},
  {
    get(_, prop) {
      const store = getStore();
      if (prop === 'useSupabase') return Boolean(getSupabase());
      return store[prop];
    },
  }
);
