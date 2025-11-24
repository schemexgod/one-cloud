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
import { createDatabase, getDatabase, getTables, hasAccess, runSql } from "./db/db-functions.js";
import { getAppOneShot, getUserOrFail } from "./auth/user-db-admin.js";
import { readFileSync } from "fs";
import path from "path";
import { AppError } from "./common/AppError.js";

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
  const authOneShot = getAuth(getAppOneShot());

  const decodedToken = await authPlay
    .verifyIdToken(jwtToken);
  const uid = decodedToken.uid;
  return await authOneShot.createCustomToken(uid, { email: decodedToken.email, emailVerified: decodedToken.email_verified });
}

/**
 * All functions for User's Admin of their projects and account. (ex: CRUD Database, Auth, Storage)
 */
export const userAdmin = onRequest({
  cors: '*',
  timeoutSeconds: 300
},
  async (req, res) => {
    let reqPath = req.path
    if (reqPath.startsWith('/')) {
      reqPath = reqPath.slice(1)
    }

    const pathParts = reqPath.split('/')
    const rootEndpoint = pathParts[0]

    // TODO: Separate by request types vs endpoints. Might be better easier for pointing to read replicas

    switch (rootEndpoint) {
      case 'db':
        return _processDBEndpoint(pathParts, req, res)
      case 'sql':
        return _processSqlEndpoint(pathParts, req, res)
    }

    return res.status(404).json({ error: 'Endpoint not found' })
  })

const _processSqlEndpoint = async (pathParts, req, res) => {
  try {
    let dbId = pathParts[1]
    if (!dbId) {
      throw new AppError('Missing database id', 404)
    }
    dbId = decodeURIComponent(dbId)
    const user = await getUserOrFail(req, res)
    if (!user) {
      throw new AppError('Not signed in')
    }
    const isAllowed = hasAccess(user.uid, dbId)
    if (!isAllowed) {
      throw new AppError('Access not allowed', 501)
    }
    const result = await runSql(user, dbId, req.body.sqlCmd)

    return res.status(200).json({ data: result.rows ?? [] })
  }
  catch (error) {
    return res.status(error.code ?? 500).json({ error: error.message ?? 'k' })
  }

}

const _processDBEndpoint = async (pathParts, req, res) => {
  const reqMethod = req.method.toUpperCase()
  let dbId = pathParts[1]

  // If no DB specified then get all databases or create one
  if (!dbId) {
    switch (reqMethod) {
      case 'POST':
        return createDatabase(req, res)
      case 'GET':
        return getDatabase(req, res)
      case 'DELETE':

        // TODO
        return;
        return getDatabase(req, res)
    }
  }
  // Handle specific DB 
  else {
    dbId = decodeURIComponent(dbId)

    // Check if specific table is requested
    const processTable = _processDBTableEndpoint(pathParts, req, res)
    if (processTable) {
      return processTable
    }

    // No table specified
    switch (reqMethod) {
      case 'POST':
        // return createDatabase(req, res)
        return

      // Get database schema
      case 'GET':
        return getTables(req, res, dbId)

      case 'DELETE':
        return
      // return getDatabase(req, res)
    }

  }
}

const _processDBTableEndpoint = (pathParts, req, res) => {
  const reqMethod = req.method.toUpperCase()
  let dbId = pathParts[1]
  let tableId = pathParts[2]

  // Exit if no db or table id
  if (!(dbId && tableId)) {
    return
  }
  dbId = decodeURIComponent(dbId)
  tableId = decodeURIComponent(tableId)

  switch (reqMethod) {
    // Alter table
    case 'PATCH', 'POST', 'PUT':
      return
  }

}
