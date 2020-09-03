const MeteorSettings = {
  public: {
    tenant: 'mock_tenant',
    featureFlags: {
      jobs: true,
      events: true,
      reporting: true,
    },
  },
};

// FIXME: we can't use ES6 imports in mocks, not sure why
module.exports = {
  settings: MeteorSettings,
  userId: () => 'mock_user_id',
  startup: () => {},
  _localStorage: window ? window.localStorage : { setItem: () => {}, getItem: () => {} },
  isClient: true,
  isServer: false,
  absoluteUrl: () => 'http://vulcanjs.org/',
};
