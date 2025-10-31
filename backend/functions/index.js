/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onCall, onRequest } from "firebase-functions/v2/https";
import { getApp, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import admin from "firebase-admin";
import { Pool } from 'pg';
import { Connector } from '@google-cloud/cloud-sql-connector';
import { format } from "node-pg-format";
import { dbClient } from "./db/db-connector.js";
import { createDatabase, getDatabase } from "./db/db-functions.js";
import { appOneShot } from "./auth/user-db-admin.js";

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
        return error
      }
    }
    // throw new Error('no auth id');
    return 'no auth id'
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

  let appPlayAuth
  try {
    appPlayAuth = getApp('playauth')
  } catch (e) {
    appPlayAuth = initializeApp(firebaseConfigPlayAuth, 'playauth');
  }

  const authPlay = getAuth(appPlayAuth);
  const authOneShot = getAuth(appOneShot);

  const decodedToken = await authPlay
    .verifyIdToken(jwtToken);
  const uid = decodedToken.uid;
  return await authOneShot.createCustomToken(uid, { email: decodedToken.email, emailVerified: decodedToken.email_verified });
}

/**
 * All functions for User's Admin of their projects and account. (ex: CRUD Dataabase, Auth, Storage)
 */
export const userAdmin = onRequest({
  cors: '*',
  timeoutSeconds: 300,
},
  async (req, res) => {
    let path = req.path
    if (path.startsWith('/')) {
      path = path.slice(1)
    }
    const pathParts = path.split('/')
    const rootEndpoint = pathParts[0]
    const reqMethod = req.method.toUpperCase()

    switch (rootEndpoint) {
      case 'db':

        const dbId = pathParts[1]

        // If no DB specified then get all databases or create one
        if (!dbId) {
          switch (reqMethod) {
            case 'POST':
              return createDatabase(req, res)
            case 'GET':
              return getDatabase(req, res)
          }
        }

    }

    return res.status(404).json({ error: 'Endpoint not found' })
  })

