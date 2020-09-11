import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import httpLink from './links/http';
import wsLink from './links/ws';
import meteorAccountsLink from './links/meteor';
import errorLink from './links/error';
import { createStateLink } from '../../modules/apollo-common';
import cache from './cache';
import { getTerminatingLinks, getLinks } from './links/registerLinks';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';

// these links do not change once created
const staticLinks = [errorLink, meteorAccountsLink];

let apolloClient;
export const createApolloClient = () => {
  // links registered by packages
  const registeredLinks = getLinks();
  const terminatingLinks = getTerminatingLinks();
  if (terminatingLinks.length > 1) {
    throw new Error('Warning: You registered more than one terminating Apollo link.');
  }

  const terminatingLinksWithDefault = terminatingLinks.length ? terminatingLinks[0] : httpLink;

  const splitLink = split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    wsLink,
    terminatingLinksWithDefault
  );

  const stateLink = createStateLink({ cache });
  const newClient = new ApolloClient({
    link: ApolloLink.from([stateLink, ...registeredLinks, ...staticLinks, splitLink]),
    cache,
  });
  // register the client
  apolloClient = newClient;
  return newClient;
};

export const getApolloClient = () => {
  if (!apolloClient) {
    // eslint-disable-next-line no-console
    console.warn('Warning: accessing apollo client before it is initialized.');
  }
  return apolloClient;
};

// This is a draft of what could be a reload of the apollo client with new Links
// for the moment there seems to be no equivalent to Redux `replaceReducers` in apollo-client
//@see https://github.com/apollographql/apollo-link-state/issues/306
//export const reloadApolloClient = () => {
//  // get the current cache
//  const currentCache = apolloClient.cache;
//  // get the stateLink
//  const newApolloClient = createApolloClient({
//    link: ApolloLink.from([getStateLink(), ...staticLinks]),
//    cache: currentCache
//  });
//  // update the client
//  apolloClient = newApolloClient;
//  return newApolloClient;
//};
