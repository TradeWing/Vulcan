import _merge from 'lodash/merge';
// import { registerSetting } from '../../client/main';

//import { registerSetting } from '../../modules/settings.js';
// TODO: is this still necessary?
//registerSetting('apolloEngine.logLevel', 'INFO', 'Log level (one of INFO, DEBUG, WARN, ERROR');
//registerSetting(
//  'apolloTracing',
//  Meteor.isDevelopment,
//  'Tracing by Apollo. Default is true on development and false on prod',
//  true
//);
// registerSetting('apolloServer.jsonParserOptions.limit', undefined, 'bodyParser jsonParser limit');

// NOTE: some option can be functions, so they cannot be
// defined as Meteor settings, which are pure JSON (no function)

// @see https://www.apollographql.com/docs/apollo-server/api/apollo-server.html#constructor-options-lt-ApolloServer-gt
let apolloServerOptions = {};
export const registerApolloServerOptions = options => {
  apolloServerOptions = _merge(apolloServerOptions, options);
};
export const getApolloServerOptions = () => {
  return apolloServerOptions;
};
// @see https://www.apollographql.com/docs/apollo-server/api/apollo-server.html#Parameters-2
let apolloApplyMiddlewareOptions = {};
export const registerApolloApplyMiddlewareOptions = options => {
  apolloApplyMiddlewareOptions = _merge(apolloApplyMiddlewareOptions, options);
};
export const getApolloApplyMiddlewareOptions = () => apolloApplyMiddlewareOptions;

let datasources;

export const registerDataSources = newDataSources => {
  datasources = newDataSources;
};

export const getDataSources = () => {
  return datasources;
};

let apolloServerCache;

export const registerApolloServerCache = cache => {
  apolloServerCache = cache;
};

export const getApolloServerCache = () => apolloServerCache;

let serverLogger;

export const registerServerLogger = logger => {
  serverLogger = logger;
};

export const getServerLogger = () => {
  return serverLogger;
};
