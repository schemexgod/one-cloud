import { initializeApp } from "@firebase/app";

const firebaseConfigOneShot = {
  apiKey: "AIzaSyCR3mV_zPeZlg8FSOq_zvqFa30XPyMeUeA",
  authDomain: "playoneshot-b7bfb.firebaseapp.com",
  projectId: "playoneshot-b7bfb",
  storageBucket: "playoneshot-b7bfb.firebasestorage.app",
  messagingSenderId: "38821773944",
  appId: "1:38821773944:web:f4210cb2dee00bd67da38d",
  measurementId: "G-Q64889D91S"
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
