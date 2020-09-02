// import and re-export
import './callbacks';
export * from 'meteor/vulcan:lib';

export { default as withAccess } from './containers/withAccess.js';
export { default as withMessages } from './containers/withMessages.js';
export { withMulti, useMulti } from './containers/multi.js';
export { withMulti2, useMulti2 } from './containers/multi2.js';
export { withSingle, useSingle } from './containers/single.js';
export { withSingle2, useSingle2 } from './containers/single2.js';
export { withCreate, useCreate } from './containers/create.js';
export { withCreate2, useCreate2 } from './containers/create2.js';
export { withUpdate, useUpdate } from './containers/update.js';
export { withUpdate2, useUpdate2 } from './containers/update2.js';
export { withUpsert, useUpsert } from './containers/upsert.js';
export { withUpsert2, useUpsert2 } from './containers/upsert2.js';
export { withDelete, useDelete } from './containers/delete.js';
export { withDelete2, useDelete2 } from './containers/delete2.js';
export { withCurrentUser, useCurrentUser } from './containers/currentUser.js';
export { withMutation, useRegisteredMutation } from './containers/registeredMutation.js';
export { withSiteData, useSiteData } from './containers/siteData.js';

export { default as withComponents } from './containers/withComponents';

export { default as MessageContext } from './messages.js';

// OpenCRUD backwards compatibility
export { default as withNew } from './containers/create.js';
export { default as withEdit } from './containers/update.js';
export { default as withRemove } from './containers/delete.js';
export { default as withList } from './containers/multi.js';
export { default as withDocument } from './containers/single.js';

export * from './menu';
