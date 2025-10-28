// Import the functions you need from the SDKs you need
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { appOneShot, appPlayAuth } from "../constants"
import { getFunctions, httpsCallable } from 'firebase/functions';

// Initialize Firebase
const app = appPlayAuth
const provider = new GoogleAuthProvider();
const auth = getAuth(app)

/**
 * 
 * @param {function(string)} onSuccess - callback if sign in succeeds it receives a JWT Token to pass to OneShot Auth
 * @param {*} onError 
 */
export function showSignInOptions(onSuccess, onError) {
  onAuthStateChanged(auth, async (user) => {
    // Check if auth already
    console.log("-- already signed in", auth.currentUser)
    if (user) {
      console.log("-- already signed in")
      // onSuccess(user.accessToken);
      try {
        let newToken = await user.getIdToken()
        newToken = await authWithNewToken(newToken)
        onSuccess(newToken, { email: user.email, emailVerified: user.emailVerified, displayName: user.displayName })
        return

      } catch (error) {
        console.error("Error getting ID token:", error);
      }
      // user.getIdToken()
      //   .then((idToken) => {
      //     console.log('idToken', idToken)
      //     return authWithNewToken(idToken)
      //   })
      //   .then((newToken) => {
      //     console.log('idonSuccessToken', newToken)
      //     onSuccess(newToken, { email: user.email, emailVerified: user.emailVerified, displayName: user.displayName })
      //     return newToken
      //   })
      //   .catch((error) => {
      //     console.error("Error getting ID token:", error);
      //   });
      // return;
    }
    document.body.innerHTML = `
      <div id="google-btn" style="color: white; cursor: pointer; background-color: blue;">sign in with google</div>
    `;

    document.getElementById('google-btn').addEventListener('click', () => {
      signInWithPopup(auth, provider)
        .then((result) => {
          // This gives you a Google Access Token. You can use it to access the Google API.
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential.accessToken;
          // The signed-in user info.
          const user = result.user;
          // IdP data available using getAdditionalUserInfo(result)
          // ...
          console.log('user', user)
          console.log('auth', auth)

          user.getIdToken()
            .then((idToken) => {
              console.log('idToken', idToken)
              return authWithNewToken(idToken)
            })
            .then((newToken) => {
              console.log('idonSuccessToken', newToken)
              onSuccess(newToken, { email: user.email, emailVerified: user.emailVerified, displayName: user.displayName })
              return newToken
            })
            .catch((error) => {
              console.error("Error getting ID token:", error);
            });
        }).catch((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          // The email of the user's account used.
          const email = error.customData.email;
          // The AuthCredential type that was used.
          const credential = GoogleAuthProvider.credentialFromError(error);
          // ...
          console.log('error', error)
          throw error
        });
    })
  })


}

const authWithNewToken = (newToken) => {
  const functions = getFunctions(appOneShot);
  const myCallableFunction = httpsCallable(functions, 'authSignInWithToken');
  console.log('functions', myCallableFunction)

  return myCallableFunction({ jwtToken: newToken })
    .then((result) => {
      console.log('*******', result.data); // Access the data returned by the function
      return result.data
    })
  // .catch((error) => {
  //   console.error('Error calling function:', error);
  // });
}


// const auth = getAuth();
// signInWithCustomToken(auth, token)
//   .then((userCredential) => {
//     // Signed in
//     const user = userCredential.user;
//     // ...
//   })
//   .catch((error) => {
//     const errorCode = error.code;
//     const errorMessage = error.message;
//     // ...
//   });