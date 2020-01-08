/*

Generic mutation wrapper to insert a new document in a collection and update
a related query on the client with the new item and a new total item count. 

Sample mutation: 

  mutation createMovie($data: CreateMovieData) {
    createMovie(data: $data) {
      data {
        _id
        name
        __typename
      }
      __typename
    }
  }

Arguments: 

  - data: the document to insert

Child Props:

  - createMovie({ data })
    
*/

import React from 'react';
import gql from 'graphql-tag';
import { createClientTemplate } from 'meteor/vulcan:core';
import { extractCollectionInfo, extractFragmentInfo, filterFunction, getApolloClient } from 'meteor/vulcan:lib';
import { useMutation } from '@apollo/react-hooks';
import { buildMultiQuery } from './multi';
import { addToData, getVariablesListFromCache, matchSelector, addToDataSingle } from './cacheUpdate';
import { singleQuery as singleQueryFn } from './single2';

export const buildCreateQuery = ({ typeName, fragmentName, fragment }) => {
  const query = gql`
    ${createClientTemplate({ typeName, fragmentName })}
    ${fragment}
  `;
  return query;
};

/**
 * Update cached list of data after a document creation
 */
export const multiQueryUpdater = ({
  typeName,
  fragment,
  fragmentName,
  collection,
}) => async (cache, { data }) => {
  const resolverName = `create${typeName}`;
  const multiResolverName = collection.options.multiResolverName;
  // update multi queries
  const multiQuery = buildMultiQuery({ typeName, fragmentName, fragment });
  const newDoc = data[resolverName].data;
  // get all the resolvers that match
  const client = getApolloClient();
  const variablesList = getVariablesListFromCache(cache, multiResolverName);
  // compute all necessary updates
  const multiQueryUpdates = (await Promise.all(
    variablesList
      .map(async variables => {
        try {
          const queryResult = cache.readQuery({ query: multiQuery, variables });
          // get mongo selector and options objects based on current terms
          const multiInput = variables.input;
          // TODO: the 3rd argument is the context, not available here
          // Maybe we could pass the currentUser? The context is passed to custom filters function
          const filter = await filterFunction(collection, multiInput, {});
          const { selector, options: paramOptions } = filter;
          const { sort } = paramOptions;
          // check if the document should be included in this query, given the query filters
          if (matchSelector(newDoc, selector)) {
            // TODO: handle order using the selector
            const newData = addToData({ queryResult, multiResolverName, document: newDoc, sort, selector });
            // memorize updates just in case
            return { query: multiQuery, variables, data: newData };
          }
        } catch (err) {
          // could not find the query
          // TODO: be smarter about the error cases and check only for cache mismatch
          console.log(err);
        }
      })
  )
  ).filter(x => !!x); // filter out null values
  // apply updates to the client
  multiQueryUpdates.forEach((update) => {
    client.writeQuery(update);
  });
  // return for potential chainging
  return multiQueryUpdates;
};

export const singleQueryUpdater = ({
  typeName,
  fragment,
  fragmentName,
  collection,
}) => async (cache, { data }) => {
  const resolverName = `create${typeName}`;
  const singleResolverName = collection.options.singleResolverName;
  // update multi queries
  const singleQuery = singleQueryFn({ typeName, fragmentName, fragment });
  const newDoc = data[resolverName].data;
  // get all the resolvers that match
  const client = getApolloClient();
  const variablesList = getVariablesListFromCache(cache, singleResolverName);
  // compute all necessary updates

  const singleQueryUpdates = (await Promise.all(
    variablesList.map(async variables => {
      try {
        const queryResult = cache.readQuery({ query: singleQuery, variables });
        // get mongo selector and options objects based on current terms
        const singleInput = variables.input;
        // TODO: the 3rd argument is the context, not available here
        // Maybe we could pass the currentUser? The context is passed to custom filters function
        const filter = await filterFunction(collection, singleInput, {});
        const { selector } = filter;
        // check if the document should be included in this query, given the query filters
        if (matchSelector(newDoc, selector)) {
          // TODO: handle order using the selector
          const newData = addToDataSingle({
            queryResult,
            singleResolverName,
            document: newDoc,
          });
          // memorize updates just in case
          return { query: singleQuery, variables, data: newData };
        }
      } catch (err) {
        // could not find the query
        // TODO: be smarter about the error cases and check only for cache mismatch
        console.log(err);
      }
    }),
  )).filter(x => !!x); // filter out null values
  // apply updates to the client
  singleQueryUpdates.forEach(update => {
    client.writeQuery(update);
  });
  // return for potential chainging
  return singleQueryUpdates;
};

const queryUpdaters = ({
  typeName,
  fragment,
  fragmentName,
  collection,
}) => async (cache, { data }) => {
  await multiQueryUpdater({
    typeName,
    fragment,
    fragmentName,
    collection,
  })(cache, { data });
  await singleQueryUpdater({
    typeName,
    fragment,
    fragmentName,
    collection,
  })(cache, { data });
};

const buildResult = (options, resolverName, executionResult) => {
  const { data } = executionResult;
  const propertyName = options.propertyName || 'document';
  const props = {
    ...executionResult,
    [propertyName]: data && data[resolverName] && data[resolverName].data,
  };
  return props;
};

export const useCreate2 = (options) => {
  const { mutationOptions = {} } = options;
  const { collectionName, collection } = extractCollectionInfo(options);
  const { fragmentName, fragment } = extractFragmentInfo(options, collectionName);

  const typeName = collection.options.typeName;

  const query = buildCreateQuery({ typeName, fragmentName, fragment });

  const resolverName = `create${typeName}`;

  const originalUpdate = options.mutationOptions && options.mutationOptions.update;
  if (originalUpdate) {
    const propertyName = options.propertyName || 'document';
    const extendedUpdateFunc = (cache, executionResult) => {
      const {data} = executionResult;
      executionResult.extensions = {
        ...executionResult.extensions,
        [propertyName]: data && data[resolverName] && data[resolverName].data,
      }
      return originalUpdate(cache, executionResult);
    }
    options.mutationOptions.update = extendedUpdateFunc;
  }

  const [createFunc, ...rest] = useMutation(query, {
    update: queryUpdaters({ typeName, fragment, fragmentName, collection }),
    ...mutationOptions
  });

  // so the syntax is useCreate({collection: ...}, {data: ...})
  const extendedCreateFunc = async (args) => {
    const executionResult = await createFunc({
      variables: { data: args.data },
    });
    return buildResult(options, resolverName, executionResult);
  };
  return [extendedCreateFunc, ...rest];
};

export const withCreate2 = options => C => {
  const { collection } = extractCollectionInfo(options);
  const typeName = collection.options.typeName;
  const funcName = `create${typeName}`;
  const legacyError = () => {
    throw new Error(`newMutation function has been removed. Use ${funcName} instead.`);
  };
  const Wrapper = props => {
    const [createFunc] = useCreate2(options);
    return <C
      {...props}
      {...{ [funcName]: createFunc }}
      newMutation={legacyError}
    />;
  };

  Wrapper.displayName = `withCreate${typeName}`;
  return Wrapper;
};

export default withCreate2;
