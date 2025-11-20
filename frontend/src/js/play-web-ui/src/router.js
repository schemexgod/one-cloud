/**
 * An object map describing the routes and function to perform if matched
 * 
 * Example:
 * {
 *      '/user/:id(/:nickname)': (params) => {
 *          console.log('User page, ID:', params.id, params.nickname);
 *          document.body.innerHTML = `<h1>User ${params.id}</h1><a href="/">Home</a>`;
 *      }
 * }
 * 
 * @typedef {Object.<string, (params: Object<string, any>, fullPath: string) => void>} RouteMap
 */


/**
 * Main Router Class
 */
export class Router {
    routes = []
    /**
     * Sets the routes
     * @param {RouteMap} routes 
     */
    constructor(routes = {}) {
        this.addRoutes(routes);
        this.notFoundHandler = null;
        this.handleRoute = this.handleRoute.bind(this)
        this._handleClick = this._handleClick.bind(this)
    }

    start() {
        // Listen for popstate (back/forward buttons)
        window.addEventListener('popstate', this.handleRoute);

        // Intercept all link clicks
        document.addEventListener('click', this._handleClick);

        // Handle initial route
        this.handleRoute();
        return this
    }

    stop() {
        // Listen for popstate (back/forward buttons)
        window.removeEventListener('popstate', this.handleRoute);

        // Intercept all link clicks
        document.removeEventListener('click', this._handleClick);

    }
    _handleClick(e) {
        const link = e.target.closest('a');
        if (link && link.href && link.origin === window.location.origin && !link.target) {
            e.preventDefault();
            this.navigate(link.pathname);
        }
    }

    // Add routes from an object
    addRoutes(routes) {
        Object.entries(routes).forEach(([pattern, handler]) => {
            this.route(pattern, handler);
        });
        return this
    }

    // Add a single route
    route(pattern, handler) {
        const { regex, paramNames } = this.patternToRegex(pattern);
        this.routes.push({ pattern, regex, paramNames, handler });
    }

    // Handle 404 not found
    notFound(handler) {
        this.notFoundHandler = handler;
    }

    // Convert route pattern to regex and extract param names
    patternToRegex(pattern) {
        const paramNames = [];

        // Extract all parameter names (both optional and required)
        const matches = pattern.matchAll(/:(\w+)/g);
        for (const match of matches) {
            paramNames.push(match[1]);
        }

        // Convert pattern to regex
        const regexPattern = pattern
            .replace(/[\-{}\[\]+?.,\\\^$|#\s]/g, '\\/') // Escape slashes
            .replace(/\((.*?)\)/g, '(?:\\/([^/]+))?') // Optional params like (/:id)
            .replace(/(\(\?)?:\w+/g, '([^/]+)') // Required params like :id
            .replace(/\*/g, '(.*)'); // Wildcards

        return {
            regex: new RegExp(`^${regexPattern}$`),
            paramNames
        };
    }

    // Extract parameter values
    extractParams(paramNames, values) {
        const params = {};

        paramNames.forEach((name, i) => {
            // Only add param if value exists and is not undefined
            if (values[i] !== undefined && values[i] !== '') {
                params[name] = values[i];
            }
        });

        return params;
    }

    // Handle current route
    handleRoute() {
        const path = window.location.pathname;

        for (const route of this.routes) {
            const match = path.match(route.regex);

            if (match) {
                const params = this.extractParams(route.paramNames, match.slice(1));
                route.handler(params, path);
                return;
            }
        }

        // No route matched
        if (this.notFoundHandler) {
            this.notFoundHandler(path);
        }
    }

    // Navigate to a route
    navigate(path) {
        window.history.pushState(null, '', path);
        this.handleRoute();
    }
}

/**
 * Creates a new router with the given RouterMap
 * @param {RouteMap} routeMap 
 * @returns {Router}
 */
export const createRouter = (routeMap) => {
    return new Router(routeMap)
}
