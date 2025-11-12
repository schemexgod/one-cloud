import { getAuth, onAuthStateChanged, signInWithCustomToken, updateCurrentUser, User } from "firebase/auth";
import { appOneShot } from "./constants";
import { Router } from "./routes";



// Main App
const init = async () => {
  // Initialize Firebase
  const fbaseApp = appOneShot

  // Check if signed in
  const auth = getAuth(fbaseApp);
  const user = await setupAuthState(auth)
  const jwtToken = await user?.getIdToken()
  console.log('user', user, jwtToken)

  // Go to sign in
  const route = location.pathname
  if (route == '/signout') {
    auth.signOut()
  }
  if (!user) {
    loadSignin(auth)
    return
  }
  /** @type {AppContext} */
  const context = {
    authToken: jwtToken
  }
  // Go to route
  // For now just got to database list
  showDBPage(context)
}

/** @param {AppContext} context */
async function showDBPage(context) {
  try {
    const module = await import('./pages/database.js');
    module.init(context)
  } catch (error) {
    console.error("Error loading module:", error);
  }
}

/**
 * Setup the Auth listener when a user signs in or out. returns the user if signed in
 * @param {function(User)?} onSignedIn 
 * @param {function?} onSignedOut 
 * @returns {Promise<User>?}
 */
const setupAuthState = (auth, onSignedIn, onSignedOut) => {
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

// Run App 
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}






// REMOVE ME LATER
async function loadSignin(auth) {
  try {
    const module = await import('./signin/signin.js');
    module.showSignInOptions((token, otherOptions) => {
      console.log('onSuccess', token)
      signInWithCustomToken(auth, token)
        .then((userCredential) => {
          // Signed in
          var user = userCredential.user;
          user.email = otherOptions.email
          user.emailVerified = otherOptions.emailVerified
          user.displayName = otherOptions.displayName
          console.log('SIGN IN WITH CUSTOMTOKEN', userCredential)
          return updateCurrentUser(auth, user)
          // ...
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log('SIGN IN WITH ERROR', error)
          // ...
        });
    });
  } catch (error) {
    console.error("Error loading module:", error);
  }
}

