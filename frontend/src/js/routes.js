
class Route {
  /** @type {string} path of the url (ex: '/page1') */
  path
  /** @type {string} URL of the script to run when that route is matched */
  scriptUrl

  /**
   * 
   * @param {string} path path of the url (ex: '/page1')
   * @param {string} scriptUrl URL of the script to run when that route is matched
   */
  constructor(path, scriptUrl) {
    this.path = path;
    this.scriptUrl = scriptUrl;
  }
}


// Cached regular expressions for matching named param parts and splatted
// parts of route strings.
const optionalParam = /\((.*?)\)/g;
const namedParam = /(\(\?)?:\w+/g;
const splatParam = /\*\w+/g;
const escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;

/**
 * Routes can contain parameter parts, :param, which match a single URL component between slashes; and splat parts *splat, which can match any number of URL components. Part of a route can be made optional by surrounding it in parentheses (/:optional).
 */
export class Router {
  /** @type {Object.<string, Route>} an object map of route paths to the route (ex: {'/page1': new Route()}) */
  routes = {}

  /**
   * 
   * @param {string} path path of the url (ex: '/page1') 
   * @returns {Route?} returns the route if it exists
   */
  matchRoute(path) {
    return routes[path]
  }

  /**
   * 
   * @param {string} route 
   * @returns {RegExp}
   */
  _routeToRegExp(route) {
    route = route.replace(escapeRegExp, '\\$&')
      .replace(optionalParam, '(?:$1)?')
      .replace(namedParam, function (match, optional) {
        return optional ? match : '([^/?]+)';
      })
      .replace(splatParam, '([^?]*?)');

    return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
  }
}
