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

const credJson = {
  "type": "service_account",
  "project_id": "oneshot-c5e23",
  "private_key_id": "3c4c440ad68b19c8d87fa98723b7fb1188528f20",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCyCjWigS8SpTVb\nLrjmlZQIlj64UnKkSeM2t/XWLEwPDKUv4Nsh+3bLTm1UoUdAVySJo5YPAuPJurow\n+1OSN78euSuysNP0sNvP+WQOz2YEtXNEhrfVlVZDUPb938YufOfMIpU3Otx71p2W\n3AjOiXRaVK6rc756qGEuHUc509ephQK/EeRHLWl6b/oMVz7v0RZqGw9yejkn4z3g\nIjgYaM/isLcWVChkM5TqNYo18ZG629+LXCCPMKlVS65kH2Tmpf3yuIuK/QSPSW8r\ndmg0If9y1xJzC+rmMKA8XSQIboD0k0QWgmuxeubvWugosfMQJkErSwpreXa35ogA\nBGYzcYUdAgMBAAECggEAC6znOQWrOlgKsHTXK8nl2A1QRiKkAXmV9KXqMXYcs8Ty\nxTnD7Q3SS8FUIp9j7oh4bS1E3y2jlfxQjvtATv+oYSGoB7MYZzy84X3bjawUptzm\nVvlVr2Q4cLgrxljJJI3M3qJq8iECSf24PmcmDbNOZckVXkl8FYuaud0yKUzm4Ocr\nxZNa7bIFkCyG5HKmpnix5tas9AEw9Wet1lFeBBswRaweg/gutGwbX7NDWlDH/fG9\n6RB5AX0HFfLYbxJ8LzgWwsSK60r19vxmK5YdNS/lr9KSjPIRFTkZ1mf8+tiq1v8F\nE99lcA/TL8FzqQSc8ssA7a5NByR5bowzdGWcenVhWQKBgQDlIIuxxRXNtTJqZoV3\nq8ZcBaK3QS4RA/AeKENBS1zjfZYEFAZkWJ0gPcEDpBW072G0zfv88Yr7SSDp7FWe\nVqXrqHazbOnmD+mqXr0QHOwbbRnB6C2BrKV3yLnrRrT+6SZPo0Rql8HmG6KzbLBI\nrhcBXsubwMsJ3BDoAXIZ8OGICQKBgQDG68nopKxb+ny2Su8YC4IPtDWklxZXT55J\nlBbgb3xkMMgwZ7fT4jNVyQYaGGVK9rVPT1lfy3OUlZ6s0zoWR406swQMVkCr/Ch/\nPggO2eVZm4wuIIlRuT4EMMFaoUCbi0cRBLvdIAVhxBcR56rCvHvTLxxRHEYPovS0\nE8Xnh5fRdQKBgGLcUQnp5Id2WANqqsnAtvx7fgKdv/edgFwyuRoSH0kUpcaqsTtY\ntKr1mjMs+CSyaLDvc3tm6LWVjvr/es2vyzVL4bN3GdCnKwXUjLTIFeObhlKREBl0\nWYy+ceGfB3c5N8uCwYFQa1wSrnfGPKWPX+O6eBWC8NgXOMAx535j3ZupAoGAc5tF\nVPefVDVXlXonSoolpIrPQkCss0GKdKikQvuIB5JyRe+BXprvysNx0GitNcv7w4QS\nJSJQoeHyve5kq94ZriusBp96Jnn97zVV6YupR1KnPYebRuuppzXOqaVdrwha3QEr\nTW/2sMMNxVImY9a3AB05D8qmzR+fp6h2NAERsqECgYBRqe6/UX3GQ/dQit/xPAI6\nyvvVIESGwXOzhQi6YhwPCred5rFJL9rcUjKoJeqh2c6xR1VPo6jJ+b4BpESPwlvJ\niuleJoGL3PKZ/tlwOqxI5XoGmmUn80UQ1zcje1XuBlchQLDPrbFyj8bHWAspUfBl\n5cyYSMvFlfa2Tljz3x9WJA==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@oneshot-c5e23.iam.gserviceaccount.com",
  "client_id": "117563772918708592588",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40oneshot-c5e23.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
  ;

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


export const testDB = onRequest({
  cors: '*',
  timeoutSeconds: 300,
},
  async (req, res) => {
    const connector = new Connector();
    try {
      
      const pool = new Pool({
        user: 'postgres',
        password: 'Oneshot123!',
        host: '10.124.144.3', // Private IP of your Cloud SQL instance
        database: 'test-cloud-func',
        port: 5432,
      });

      const { rows } = await pool.query('SELECT NOW()');
      res.status(200)
        .json({
          data: rows,
        })

      await pool.end();
      connector.close();

    } catch (error) {
      res.status(500)
        .json({ error: error, otherMsg: otherMsg })
    }

  })

