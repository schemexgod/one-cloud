import { initializeApp } from "@firebase/app";

const firebaseConfigOneShot = {
  apiKey: "AIzaSyAkdn0tCxnJsExw1eYns5QSihmr8UPiNQs",
  authDomain: "oneshot-c5e23.firebaseapp.com",
  projectId: "oneshot-c5e23",
  storageBucket: "oneshot-c5e23.firebasestorage.app",
  messagingSenderId: "1088307290473",
  appId: "1:1088307290473:web:f1abd981121378767e1df8",
  measurementId: "G-1EB9LHCSZ5"
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
