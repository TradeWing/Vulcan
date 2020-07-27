import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import possibleTypes from './possibleTypes';

const fragmentMatcher = new IntrospectionFragmentMatcher({ introspectionQueryResultData: possibleTypes });

const cache = new InMemoryCache({ fragmentMatcher })
  //ssr
  .restore(window.__APOLLO_STATE__);
export default cache;
