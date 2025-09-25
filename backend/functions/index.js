/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onCall, onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { getApp, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import admin from "firebase-admin";

const credJson = {
  "type": "service_account",
  "project_id": "playoneshot-b7bfb",
  "private_key_id": "0480df8c987b166f36459b2fb933c01d419174e8",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC6IXAkKYl5ZMdM\nOBl4tfKxKAmeQb5YJEJJ6QxhRCt1iKDFrH21chGwn09nun19BPQopK6bdrvAChqB\nnVSlu60iW4Xrkj5l58buZdGet5Dv2F0uM2DDF+p0fJ966Eh3fnaHgyW3OxhObBUx\nA8kV68jVB4mRPEYrFWAtofUBdcF7AUFJHaZnekPgN9WrwPwPo2M0etu2II+Cpe0d\nL52KfOcjTqbXTJ4tkCXgFR4PisgLnhXqGmxXZp0G6D2DV0NGxTg+mGjCppgsMHl8\nw72iazga/z+5z2+vqFIzLhAs3EazkOsRCMfodLDhKo6nB0plyWQaWZvp5dImx1q6\nhH3IvK57AgMBAAECggEAIsXHcQIPjE2/C+a5H3uCZQVRUq7+k/HmLm+q3+r/4XvO\naU+RxpmSY3hHud21vurzgDpP4nxalARvMkLFwxaeQDpv+PP/00LrP7Nm52ts2NoH\ngm+XxqrLosp7ctc9XpGSLDvcinAwWMpJZThLU1ySzvWTBj6H71mVd8D3iDfLFyLx\nyV/8uFCwrjG/TmOX97vp2GCnMMA6H4qSgrw53gK5ROCftZSV6XYRPrGAbGiWG27K\n+vxCqFa/MNlilhT747g3sx0lLOfX8YjOMmJTjXoea6FFSJV/EyOEOYZi4+untTV0\nHFHDfUJsETSzdZUsu5XeHetaKOcZMRsa71xMJ2rIFQKBgQDhFsbkJngOq/cUPvXd\nTpHqjyWO24t+LG82omn9WJsB4Bca2L0Oid1bHPocJxP8mFmzbl9fhXvune93LFd3\nWKP5I5m4BadiAN/y+L2hdIXtSS9UGHIMxVceNw3pjPaW2cnoVgxBGNqIwr/nskq5\n+r+2bhH7IC3IhWhrhUOs5CZqDwKBgQDTsQrDSwakAOw4Yln5SeulJ7YuTsaP5Mcs\nIN5ZPCryKU1tJjVpcAhWTb+PK+fu7Azk1cKQW1VBDb519KbprfUur1ZgfP5w7Rrb\nhyjkw5HN92cVkQS9N/tifFkZNHyIWIusrxeA10cUBcUJ3uz2RWjs5Vy2lJAMDTFP\nW+i/KwKQ1QKBgCu+4n6630ByuX1s0xnkyEUe9vyxvIWUGzUyEYlUbCPMKpFkKDIo\nJyYrFozcJ21DKsPNoqmM5s40UbMGoiUmzA+ClMCIEMTiSKQPJcO4QsMgIxuj+J50\nx/6uUnzekZo1z6DhAFayft5vgx6DrzRAAHxzHfmBgoRjMS0cZE+4s6KPAoGAOKFX\n+76KXD1S9BJ7d1DrFRd2iRTR0ZSmI4v3b2/FHVsnN1fNWhN6Z3wNDsP0G9pR6LW2\ngt+sAucmWG/GZyT+PirxtIY7mwIS+T9DFU+sJalVjlNpLSVYvpP9UdzUo7TsSJne\nc70japvQhj94rLkMxLLnBoDfuBmfY1d3AA0FdrECgYEA0n6LGleGdICEEH3ZZFAD\nrUGSUCQSXLB6b8weYTy95gAwff5QFZpZEFOvkJCkCiRpC8cqfzNu8DLAmksr29CO\nZcMX8K6x5hsqPyEiU93M1tXHNrwhojzLJtb+HW2IJTtvl0RTVwE9e5x6vlgcroe8\n7ZKtup6i1Z1ExS0PyLYoc20=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@playoneshot-b7bfb.iam.gserviceaccount.com",
  "client_id": "115349168095171556015",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40playoneshot-b7bfb.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}

const appOneShot = initializeApp({ credential: admin.credential.cert(credJson) },
  'oneshot'
);

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

export const authSignInWithToken = onCall({
  cors: '*'
},
  async (req, resp) => {
    const uid = req?.data?.jwtToken;
    if (uid) {
      // Check Play's auth if this is valid
      try {
        const newToken = await verifyToken(uid);
        return newToken;
      } catch (error) {
        throw new Error(uid);
      }
    }
    throw new Error('no auth id');
  });


const verifyToken = async (jwtToken) => {

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

  const appPlayAuth = getApp('playauth') ?? initializeApp(firebaseConfigPlayAuth, 'playauth');
  const authPlay = getAuth(appPlayAuth);
  const authOneShot = getAuth(appOneShot);

  const decodedToken = await authPlay
    .verifyIdToken(jwtToken);
  const uid = decodedToken.uid;
  return await authOneShot.createCustomToken(uid);
}