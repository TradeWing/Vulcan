import { getSetting } from '../../modules/settings.js';
// @see https://www.apollographql.com/docs/apollo-server/api/apollo-server.html#EngineReportingOptions

let engineConfigObject = getSetting('apolloEngine');

if (!engineConfigObject || !engineConfigObject.apiKey) {
  engineConfigObject = {
    apiKey: process.env.APOLLO_KEY,
    graphVariant: process.env.APOLLO_GRAPH_VARIANT,
    sendHeaders: {
      /* X-Request-ID is set by the heroku router
      Hopefully this will allow us to associate data between 
      AGM and Datadog/Heroku.
      */
      onlyNames: ['X-Request-ID'],
    },
  };
}

export const engineConfig = engineConfigObject && engineConfigObject.apiKey ? engineConfigObject : undefined;
