/** 
 * @typedef {Object} AppContext
 * @property {string?} authToken - JWT Token for the user
 * @property {Route?} route - Current route of the app
 * 
*/

/**
 * @typedef {Object} Route
 * @property {string} path - Full route path (ex: `/user/userId-123`)
 * @property {object} params - Object map of params from the Route. (ex: `/user/:id` -> {id: 'id-from-url'})
 * @property {object} query - Object map of params from the Route. (ex: `/user?name='eric'` {name: 'eric'})
 */