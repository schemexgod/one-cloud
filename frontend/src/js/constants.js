import { initializeApp } from "@firebase/app";

const firebaseConfigOneShot = {
    apiKey: "AIzaSyDkreBOODrNhMrKUjM6D4W_wg57UVcPWFQ",
    authDomain: "lume-d3efc.firebaseapp.com",
    databaseURL: "https://lume-d3efc-default-rtdb.firebaseio.com",
    projectId: "lume-d3efc",
    storageBucket: "lume-d3efc.firebasestorage.app",
    messagingSenderId: "82475007167",
    appId: "1:82475007167:web:65d904fa3cd7977207da0a",
    measurementId: "G-QM4RJSJQQN"
};

const firebaseConfigPlayAuth = {
  apiKey: "AIzaSyAx-8QiNAGjlYArMcRez9kcS32luws2X_k",
  authDomain: "staging-play-app-e0c3d.firebaseapp.com",
  databaseURL: "https://staging-play-app-e0c3d.firebaseio.com",
  projectId: "staging-play-app-e0c3d",
  storageBucket: "staging-play-app-e0c3d.appspot.com",
  messagingSenderId: "884946374877",
  appId: "1:884946374877:web:970aca62595b34db3f4b34",
  measurementId: "G-HE1G6SSR4Y"
};

export const appOneShot = initializeApp(firebaseConfigOneShot, 'oneshot');
export const appPlayAuth = initializeApp(firebaseConfigPlayAuth, 'playauth');
