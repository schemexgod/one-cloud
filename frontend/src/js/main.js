import { initializeApp } from "@firebase/app";
import { getFirestore, collection, getDocs } from "@firebase/firestore";
// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
    apiKey: "AIzaSyDkreBOODrNhMrKUjM6D4W_wg57UVcPWFQ",
    authDomain: "lume-d3efc.firebaseapp.com",
    databaseURL: "https://lume-d3efc-default-rtdb.firebaseio.com",
    projectId: "lume-d3efc",
    storageBucket: "lume-d3efc.firebasestorage.app",
    messagingSenderId: "82475007167",
    appId: "1:82475007167:web:65d904fa3cd7977207da0a",
    measurementId: "G-QM4RJSJQQN"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);


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
run()