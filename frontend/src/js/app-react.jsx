import { Router } from "./play-web-ui/src/router"
import { createRoot } from "react-dom/client";
import './app.css'
import { BrowserRouter, Route, Routes } from "react-router";
import { HomePage } from "./pages/home";


const router = new Router()

/** @type {AppContext} */
const context = {}

export const App = () => {
  return (
    <BrowserRouter>
      <div>
        <header id="header">
          <div className="header-content">
            <h1>PlayCloud</h1>
            <nav>
              <a href="/databases">databases</a>

              <a href="/signout">signout</a>
            </nav>
          </div>
        </header>
        <main id="main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} /> */}
          </Routes>
        </main>
        <div id="modal-container" />
      </div>
    </BrowserRouter>
  )
}

/** Initialize App */
async function init() {

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

}

// Render to DOM
const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);