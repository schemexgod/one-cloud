import { getAuth, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { appOneShot } from "./constants";
import { Router } from "./routes";



// Main App
const init = async () => {
  // Initialize Firebase
  const fbaseApp = appOneShot

  // Check if signed in
  const auth = getAuth(fbaseApp);
  const user = await setupAuthState(auth)

  console.log('user', user)

  // Go to sign in
  if (!user) {
    loadSignin()
    return
  }

  // Go to route
  // For now just got to database list
  showDBPage()
}

async function showDBPage() {

  try {
    const module = await import('./pages/database.js');
    module.init()
  } catch (error) {
    console.error("Error loading module:", error);
  }
}

/**
 * Setup the Auth listener when a user signs in or out. returns the user if signed in
 * @param {function(User)?} onSignedIn 
 * @param {function?} onSignedOut 
 * @returns {User?}
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
async function loadSignin() {
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
          updateCurrentUser(auth, user)
          console.log('SIGN IN WITH CUSTOMTOKEN', userCredential)
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

