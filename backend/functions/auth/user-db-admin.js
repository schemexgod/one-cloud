import { initializeApp } from "firebase-admin/app";
import admin from "firebase-admin";
import { AppError } from "../common/AppError.js";
import { getAuth, UserRecord } from "firebase-admin/auth";
import { readFileSync } from "fs"
/**
 * A Firebase app holds the initialization information for a collection of services.
 * @typedef {import("firebase-admin/app").App} App
 */

/** @type {App?} */
let app

/**
 * Gets and returns Firebase PlayCloud App
 * @returns {App} Firebase App
 */
export const getAppOneShot = () => {
  if (app) { return app }
  app = initializeApp({ credential: admin.credential.cert(_getCreds()) },
    'oneshot'
  );
  return app
}

/**
 * Gets the PlayCloud Credentials
 * @returns {object} Credential object
 */
const _getCreds = () => {
  try {
    const credPath = process.env.PLAY_CLOUD_CRED_PATH
    const data = readFileSync(credPath, 'utf8');
    if (typeof data === 'string') {
      const json = JSON.parse(data)
      return json
    }
  } catch (err) { }
  return {}
}

/**
 * Checks auth
 * @param {Request} req 
 * @param {Response} res 
 * @returns {Promise<UserRecord>} returns the current user id
 */
export const getUser = async (req, res) => {
  let place = 0
  try {
    const authorizationHeader = req.headers?.authorization;
    const idToken = authorizationHeader?.split('Bearer ')?.[1];
    place = '1-' + idToken
    if (!idToken) {
      throw new AppError('Authentication required. Please provide a valid Bearer token.', 401)
    }

    const authOneShot = getAuth(getAppOneShot())
    place = '2-' + authOneShot
    const decodedToken = await authOneShot.verifyIdToken(idToken)
    place = '3-' + decodedToken
    const uid = decodedToken.uid;
    place = '4-' + uid
    const user = await authOneShot.getUser(uid)
    place = '5-' + user
    return user

  } catch (error) {
    // res.json({ dddd: process.env.PLAY_CLOUD_CRED_PATH , place })
    throw new AppError("Authentication failed.", 401)
  }
}

/**
 * Checks auth and returns the user object. If not signed in then it will set the response status to an error code and output a json error message, and return undefined
 * @param {Request} req 
 * @param {Response} res 
 * @returns {Promise<UserRecord> | undefined} returns the current user or undefined
 */
export const getUserOrFail = async (req, res) => {
  try {
    return await getUser(req, res)
  } catch (error) {
    res.status(error.code ?? 500).json({ error: error.message, user: 'fail' })
    return
  }
}