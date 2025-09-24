import { initializeApp } from "@firebase/app";
import { getFirestore, collection, getDocs } from "@firebase/firestore";
import { getAuth, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { appOneShot } from "./constants.js";

// Initialize Firebase
const app = appOneShot

// Check if signed in
const auth = getAuth(app);

console.log('user', auth.currentUser)
onAuthStateChanged(auth, (user) => {
    if (!user) {
        loadSignin()
    }
})

async function loadSignin() {
    try {
        const module = await import('./signin.js');
        module.showSignInOptions((token) => {
            console.log('onSuccess', token)
            signInWithCustomToken(auth, token)
                .then((userCredential) => {
                    // Signed in
                    const user = userCredential.user;
                    console.log('SIGN IN WITH CUSTOMTOKEN', user)
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


/*

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app, "oneshot");

console.log("Firestore Initalized: ", db);

async function run() {
    try {
        const querySnapshot = await getDocs(collection(db, "userDatabases"));
        console.log('finish')
        querySnapshot.forEach((doc) => {
            console.log(`${doc.id} => ${doc.data()}`);
        });
    } catch (e) {
        console.log('e', e)
    }

}
async function loadModule() {
    try {
        const module = await import('./signin.js');
        // module.doAnotherThing();
    } catch (error) {
        console.error("Error loading module:", error);
    }
}
// loadModule();
// run()
*/