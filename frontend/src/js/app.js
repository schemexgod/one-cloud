import { getAuth, onAuthStateChanged, signInWithCustomToken, updateCurrentUser, User } from "firebase/auth";
import { appOneShot } from "./constants";
import { View, PlayWebUI } from "./play-web-ui";
import { Router } from "./play-web-ui/src/router";
import './app.css'
import NotFoundPage from "./pages/404";

class AppView extends View {
  /** Main app router */
  router = new Router()
  /** @type {AppContext} */
  context
  /** @type {HTMLElement} */
  get mainEl() { return this.domEl.querySelector('#main') }

  /**
   * @param {AppContext} context 
   */
  constructor(context) {
    context = context ?? {}
    super(context)
    this.context = context
    this.init()
  }

  /** Initialize App */
  async init() {
    // Setup Routes
    this.setupRouter()

    // Initialize Firebase
    const fbaseApp = appOneShot

    // Check if signed in
    const auth = getAuth(fbaseApp);
    const user = await this.setupAuthState(auth, undefined, () => {
      this.router.navigate('/signout')
    })
    const jwtToken = await user?.getIdToken()
    console.log('user', user, jwtToken)

    // Not signed in
    if (!user) {
      this.router.navigate('/signin')
      return
    }

    // Signed in
    this.context.authToken = jwtToken

    // Start routing
    this.router.start()
  }

  setupRouter() {
    this.router.addRoutes({
      '/': () => {
        console.log("root page")
      },
      '/databases': this.pageRoute(() => { return import('./pages/database/database.jsx') }),
      '/databases/:id': this.pageRoute(() => { return import('./pages/database/database-edit.jsx') }),
      '/databases/:id/:tableId': this.pageRoute(() => { return import('./pages/database/table-records.jsx') }),
      '/signin': this.pageRoute(() => { return import('./pages/signin/signin.jsx') }),
    })

    this.router.notFound(() => {
      const page = new NotFoundPage()
      this.domEl.querySelector('main').replaceChildren(page.domEl)
    })
  }

  /**
   * Setup the Auth listener when a user signs in or out. returns the user if signed in
   * @param {function(User)?} onSignedIn 
   * @param {function?} onSignedOut 
   * @returns {Promise<User>?}
   */
  setupAuthState(auth, onSignedIn, onSignedOut) {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(auth,
        (user) => {
          if (user) {
            onSignedIn?.(user)
          } else {
            onSignedOut?.()
          }
          resolve(user)
        },
        (error) => reject(error))
    });
  }

  /**
   * @param {function() => View} loadPageFunction The url to dynamically load
   * @returns {(params, path) => void} The route function to run
   */
  pageRoute(loadPageFunction) {
    return async (params, path) => {
      if (!loadPageFunction) { return }
      try {
        const pageView = (await loadPageFunction()).default;

        console.log('pageView', pageView, this.mainEl)

        // update context route
        this.context.route = {
          path: this.router.path,
          params: this.router.params,
          query: this.router.query
        }

        // Init page and pass in AppContext
        /** @type {pageView} */
        const page = new pageView(this.context)

        // Inser into DOM
        page.mountTo(this.mainEl)

      } catch (error) {
        console.error("Error loading module:", error);
      }
    }
  }

  compile() {
    return (
      <div>
        <header id="header">
          <div class="header-content">
            <h2>PlayCloud</h2>
            <nav>
              <a href="/databases">databases</a>

              <a href="/signout">signout</a>
            </nav>
          </div>
        </header>
        <main id="main">

        </main>
        <div id="modal-container" />
      </div>

    )
  }
}


const appView = new AppView()
appView.mountTo(document.body)



