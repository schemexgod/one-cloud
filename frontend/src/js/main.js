import { initializeApp } from "@firebase/app";
import { getFirestore, collection, getDocs } from "@firebase/firestore";
import { getAuth, onAuthStateChanged, signInWithCustomToken, updateCurrentUser } from "firebase/auth";
import { appOneShot } from "./constants.js";

// Initialize Firebase
const app = appOneShot

// Check if signed in
const auth = getAuth(app);
console.log('user', auth.currentUser)
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        loadSignin()
    } else {
        console.log('user', user)
        const jwtId =  await user?.getIdToken()
        const testEndPoint = 'https://us-central1-oneshot-c5e23.cloudfunctions.net/dbConnect'
        const postData = {
            title: 'My New Post',
            body: 'This is the content of my new post.',
            userId: "some-uid",
            endpoint: "create-db"
        };

        fetch(testEndPoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtId}`
            },
            body: JSON.stringify(postData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('New post created:', data);
            })
            .catch(error => {
                console.error('Error creating post:', error);
            });
    }
})

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

