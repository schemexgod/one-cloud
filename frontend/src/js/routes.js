import { View } from "./play-web-ui";
import { Router } from "./play-web-ui/src/router";


class AppRouter extends Router {

}

export const appRouter = new AppRouter({
  '/databases': pageRoute(() => { return import('./pages/database/database.jsx') })
})


/**
 * @param {function() => View} loadPageFunction The url to dynamically load
 * @returns {(params, path) => void} The route function to run
 */
function pageRoute(loadPageFunction) {
  return async (params, path) => {
    if(!loadPageFunction) { return }
    try {
      const pageView = (await loadPageFunction()).default;
      /** @type {pageView} */
      console.log('pageView', pageView)
      const page = new pageView()
      page.mountTo(document.getElementById('app'))
    } catch (error) {
      console.error("Error loading module:", error);
    }
  }
}