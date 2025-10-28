import { Connector } from "@google-cloud/cloud-sql-connector";
import { generateId } from "../utils/security-utils.js";
import { dbClient } from "./db-connector.js";
import { format } from "node-pg-format";
import { Client, Pool } from "pg"
import { appOneShot } from "../auth/user-db-admin.js";
import { getAuth } from "firebase-admin/auth";
/** 
 * @typedef CreateDBBody
 * @property {string} displayName
 */

/**
 * Creates a database for a given user
 * @param {Request} req 
 * @param {Response} res 
 * @returns {string} returns the database id
 */
export const createDatabase = async (req, res) => {
  // MUST be signed in
  let place = 0
  try {
    let date = Date.now()
    const authorizationHeader = req.headers?.authorization;
    place = 1
    const idToken = authorizationHeader?.split('Bearer ')?.[1];
    place = 2

    const authOneShot = getAuth(appOneShot)
    place = 3

    const decodedToken = await authOneShot.verifyIdToken(idToken);
    place = 4

    const uid = decodedToken.uid;
    place = 5

    return res.status(200).json({ msg: req?.toJSON?.(), idToken: idToken, okay: uid, other: Date.now() - date })
  } catch (error) {
    return res.status(200).json({ error: error, place })
  }

  /** @type {CreateDBBody} */
  const reqBody = req.body
  let reqName = reqBody.displayName ?? ''

  if (reqName.length == 0) {
    reqName = 'untitled'
  }

  // Create DB Name and User. Make username the same as DB name to easily keep track.
  // The User is only created to limit privleges to this specific database.
  const newDbName = format(`d${generateId()}_${reqName}`)
  const newUserName = newDbName

  const connector = new Connector()
  const clientOpts = await connector.getOptions({
    instanceConnectionName: 'oneshot-c5e23:us-central1:one-shot',
    authType: 'PASSWORD'
  });

  const pool = new Pool({
    ...clientOpts,
    user: 'postgres',
    password: 'Oneshot123!',
    // host: '10.124.144.3', // Private IP of your Cloud SQL instance
    database: 'postgres',
    port: 5432,
  });

  const client = await pool.connect()

  try {
    // Create DB with cloudsuperuser owner so its editable in gcloud web console
    const result = await client.query(`CREATE DATABASE "${newDbName}" OWNER = cloudsqlsuperuser`);
    // Create user for this DB
    const userResult = await client.query(`CREATE USER "${newUserName}"`)
    // Give user all privileges for this database
    const userAssignResult = await client.query(`GRANT ALL PRIVILEGES ON DATABASE "${newDbName}" TO "${newUserName}"`);

    res.status(200)
      .json({
        result: result,
      })

  } catch (error) {

    const errorCode = error?.code
    if (errorCode == '42P04') {
      res.status(409)
        .json({ code: '42P04', error: 'Database Exists' })
      return
    }
    res.status(500)
      .json({ code: '500', error: newDbName, error2: error })
    return
  }
  finally {
    client.release()
  }
}
