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
