import { Connector } from "@google-cloud/cloud-sql-connector";
import { generateId } from "../common/security-utils.js";
import { dbClient } from "./db-connector.js";
import { format } from "node-pg-format";
import { Client, Pool } from "pg"
import { getAppOneShot, getUser, getUserOrFail } from "../auth/user-db-admin.js";
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
    const userResult = await client.query(`CREATE USER "${newUserName}" WITH ENCRYPTED PASSWORD "Oneshot123!"`)
    // Give user all privileges for this database
    const userAssignResult = await client.query(`GRANT ALL PRIVILEGES ON DATABASE "${newDbName}" TO "${newUserName}"`);
    const userSchemaAssignResult = await client.query(`GRANT ALL ON SCHEMA public TO "${newUserName}"`);



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
  const reqBody = req.query
  const dbId = reqBody.id

  // Get specific DB
  if (dbId && false) {
    // Check if this user has Admin access to this DB
    const client = await dbClient()
    return
  }

  // Get All DBs
  let client
  try {
    client = await dbClient({ dbId: 'app', uid: user.uid })
    const { rows } = await client.query('SELECT * FROM user_databases WHERE user_id=auth.uid()');
    res.status(200)
      .json({
        data: rows,
      })
  } catch (error) {
    const errorCode = error?.code ?? 500
    if (error instanceof Error) {
      return res.status(errorCode).json({ error: error.message ?? 'Unknown connection error' })
    }
    return res.status(errorCode ?? 500)
      .json({ error: error ?? 'Unknown connection error' })
  }
  finally {
    client?.release()
  }
}


export const hasAccess = async (uid, dbId) => {
  // Get All DBs
  let client
  try {
    client = await dbClient({ dbId: 'app', uid: uid })
    const { rows } = await client.query("SELECT * FROM user_databases WHERE user_id=auth.uid() AND id=$1", [dbId]);

    return rows.length > 0

  } catch (error) {
    throw new AppError(error.message ?? 'Unknown connection error', error.code ?? 500)
  }
  finally {
    client?.release()
  }
}

export const deleteDatabase = async (req, res) => {
  // MUST be signed in
  const user = await getUserOrFail(req, res)
  if (!user) { return }

  /** @type {GetDBBody} */
  const reqBody = req.query
  const dbIds = reqBody?.ids?.split(',')

  // Check if array of ids
  if (!Array.isArray(dbIds)) {
    return
  }

  // Get All DBs
  client = await dbClient({ dbId: 'app', uid: user.uid })

  for (const dbId of dbIds) {
    try {
      const { rows } = await client.query("DELETE FROM user_databases WHERE user_id=auth.uid() AND id='$1'", [dbId]);
      if (rows[0]) {
        const { rows } = await client.query("DELETE FROM user_databases WHERE user_id=auth.uid() AND id='$1'", [dbId]);
      }
      res.status(200)
        .json({
          data: rows,
        })
    } catch (error) {
      const errorCode = error?.code
      res.status(errorCode ?? 500)
        .json({ error: error })
      return
    }
    finally {
      client.release()
    }
  }
}

/**
 * Gets tables and
 * @param {Request} req 
 * @param {Response} res 
 * @param {string} dbId 
 * @returns 
 */
export const getTables = async (req, res, dbId) => {
  // MUST be signed in
  const user = await getUserOrFail(req, res)
  if (!user) { return }

  /** @type {GetDBBody} */
  const reqBody = req.query

  // Query
  const queryStr = `SELECT 
    t.table_name,
    c.column_name AS name,
    CASE 
        WHEN c.data_type = 'character varying' THEN 
            'varchar(' || c.character_maximum_length || ')'        
        WHEN c.data_type = 'timestamp without time zone' THEN 
            'timestamp'        
        WHEN c.data_type = 'timestamp with time zone' THEN 
            'timestamp_tz'
        WHEN c.data_type = 'character' THEN 
            'char(' || c.character_maximum_length || ')'
        WHEN c.data_type = 'numeric' AND c.numeric_precision IS NOT NULL THEN
            'numeric(' || c.numeric_precision || ',' || c.numeric_scale || ')'
        ELSE c.data_type
    END AS type,
    CASE 
        WHEN c.is_nullable = 'NO' THEN true
        ELSE false
    END AS not_null
FROM 
    information_schema.tables t
JOIN 
    information_schema.columns c 
    ON t.table_schema = c.table_schema 
    AND t.table_name = c.table_name
WHERE 
    t.table_schema NOT IN ('pg_catalog', 'information_schema')
    AND t.table_type = 'BASE TABLE'
ORDER BY 
    t.table_schema,
    t.table_name,
    c.ordinal_position;`

  // Get data
  let client
  try {

    client = await dbClient({ dbId: dbId, uid: user.uid, dbUser: dbId })
    const { rows } = await client.query(queryStr);
    const returnData = {}
    const len = rows.length

    // Transform data to output format
    for (let i = 0; i < len; i++) {
      const resultColumnData = rows[i]
      const { table_name, ...columnData } = resultColumnData

      /** @type {DBTableInfo} */
      const curTableData = returnData[table_name] ?? { columns: [] }
      curTableData.columns.push(columnData)
      returnData[table_name] = curTableData
    }

    res.status(200)
      .json({
        data: returnData,
      })

  } catch (error) {
    const errorCode = error?.code ?? 500
    if (error instanceof Error) {
      return res.status(errorCode).json({ error: error.message ?? 'Unknown connection error' })
    }
    return res.status(errorCode ?? 500)
      .json({ error: error ?? 'Unknown connection error' })
  }
  finally {
    client?.release()
  }
}

export const alterTable = async (dbId, tableId, data) => {

  /** @type {AlterTablePayload} */
  const reqBody = data
  const target = reqBody.target
  const action = reqBody.action
  const payload = reqBody.value

  // Exit if missing
  if (!target) {
    throw new AppError('Missing `target` in payload', 400)
  }
  if (!action) {
    throw new AppError('Missing `action` in payload', 400)
  }
  if (!payload) {
    throw new AppError('Missing `value` in payload', 400)
  }

  // Get data
  let client
  try {
    switch (target) {
      case 'column':
        if (action == 'alter') {
          const { name, type } = payload
          client = await dbClient({ dbId: dbId, uid: user.uid, dbUser: dbId })
          const query = await client.query('ALTER TABLE "$1" ALTER COLUMN "$2" TYPE $3', [tableId, name, type])
          return true
        }
        if (action == 'add') {
          const { name, type } = payload
          client = await dbClient({ dbId: dbId, uid: user.uid, dbUser: dbId })
          const query = await client.query('ALTER TABLE "$1" ADD COLUMN "$2" $3', [tableId, name, type])
          return true
        }

      default:
        throw new AppError('Unsupported alter target', 400)
    }
  }
  catch (error) {
    const errorCode = error?.code ?? 500
    if (error instanceof Error) {
      throw new AppError(error.message ?? 'Unknown connection error', errorCode)
    }
    throw new AppError(error.message ?? 'Unknown connection error', errorCode)
  }
}



export const runSql = async (user, dbId, query) => {
  try {
    const client = await dbClient({ dbId: dbId, uid: user.uid, dbUser: dbId })
    return await client.query(query)
  }
  catch (error) {
    const errorCode = error?.code ?? 500
    throw new AppError(error.message ?? 'Unknown connection error', 400)
  }
}