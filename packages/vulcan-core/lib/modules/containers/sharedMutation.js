import { mutationOutputType } from 'meteor/vulcan:lib';

export const buildOptimisticResponse = (optimisticResponse, resolverName, typeName) => {
  return {
    [resolverName]: {
      data: {
        ...optimisticResponse,
        __typename: typeName,
      },
      __typename: mutationOutputType(typeName),
    },
  };
};

export const extendUpdateFunc = (originalUpdate, options, resolverName) => {
  const propertyName = options.propertyName || 'document';
  return (cache, executionResult) => {
    const { data } = executionResult;
    const doc = data && data[resolverName] && data[resolverName].data;
    executionResult.data = {
      ...executionResult.data,
      [propertyName]: doc,
    }
    return originalUpdate(cache, executionResult);
  }
}