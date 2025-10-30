import { Connector } from "@google-cloud/cloud-sql-connector";
import { generateId } from "../common/security-utils.js";
import { dbClient } from "./db-connector.js";
import { format } from "node-pg-format";
import { Client, Pool } from "pg"
import { appOneShot, getUser, getUserOrFail } from "../auth/user-db-admin.js";
import { AppError } from "../common/AppError.js";
/** 
 * @typedef CreateDBBody
 * @property {string} displayName
 */

/** 
 * @typedef GetDBBody
 * @property {string?} id
 */

/**
 * Creates a database for a given user
 * @param {Request} req 
 * @param {Response} res 
 * @returns {string} returns the database id
 */
export const createDatabase = async (req, res) => {
  // MUST be signed in
  const user = await getUserOrFail(req, res)
  if (!user) { return }

  // Check rate limits


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

  const client = await dbClient()
  const uid = user.uid
  let position = 0

  try {
    // Insert into our admin
    await client.query('INSERT INTO user_databases(id, user_id, name) VALUES($1, $2, $3)', [newDbName, uid, reqName])
    position = 2

    // Create DB with cloudsuperuser owner so its editable in gcloud web console
    const result = await client.query(`CREATE DATABASE "${newDbName}" OWNER = cloudsqlsuperuser`);
    position = 3
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
      .json({ code: '500', error: newDbName, error2: error, newDbName, uid, reqName, position })
    return
  }
  finally {
    client.release()
  }
}


export const getDatabase = async (req, res) => {
  // MUST be signed in
  const user = await getUserOrFail(req, res)
  if (!user) { return }

  /** @type {GetDBBody} */
  const reqBody = req.body
  const dbId = reqBody.id

  // Get specific DB
  if (dbId) {
    const client = await dbClient()
    return
  }

  // Get All DBs

}