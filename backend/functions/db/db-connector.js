
import { Connector } from '@google-cloud/cloud-sql-connector';
import { Pool } from 'pg';
import { readFileSync } from "fs"
import { AppError } from '../common/AppError.js';

// import { Connector } from '@google-cloud/cloud-sql-connector';

/** @type {Object.<string, Pool>} */
let dbPool = {}

/**
 * Gets a PoolClient from the DB Pool 
 * @param {string} dbName Name of the database to connect to. Default is `app`
 * @param {string?} uid optionally set the `auth.uid()`
 * @param {{dbId: string, uid: string?, dbUser: string?}} config
 * @returns {Promise<PoolClient>}
 */
export const dbClient = async (config = { dbId: 'app' }) => {
  const { dbId, uid, dbUser } = config

  let pool = dbPool[dbId]
  if (pool) {
    return configClient(await pool.connect(), uid)
  }

  let prog = 0
  try {
    const creds = dbUser ? { user: dbUser, password: 'Oneshot123!' } : _getCreds()
    const connector = new Connector()
    const clientOpts = await connector.getOptions({
      instanceConnectionName: 'oneshot-c5e23:us-central1:one-shot',
      authType: 'PASSWORD'
    });
    prog = 1
    // TODO: Put credentials in google secrets
    pool = new Pool({
      ...clientOpts,
      ...creds,
      // user: 'postgres',
      // password: 'Oneshot123!',
      // host: '10.124.144.3', // Private IP of your Cloud SQL instance
      database: dbId,
      port: 5432,
    });
    prog = 2
    dbPool[dbId] = pool
    const _cli = await pool.connect()
    prog = 3
    return configClient(_cli, uid)
  } catch (error) {
    throw new AppError(error.message ?? 'Cannot connect to DB', 502)
  }

}
/**
 * Gets the PlayCloud Postgres Credentials
 * @returns {object} Credential object
 */
const _getCreds = () => {
  try {
    const credPath = process.env.PLAY_CLOUD_POSTGRES_PATH
    const data = readFileSync(credPath, 'utf8');
    if (typeof data === 'string') {
      const json = JSON.parse(data)
      return json
    }
  } catch (err) {
    return { error: err.message ?? 'whooo' }
  }
  return {}
}
/**
 * 
 * @param {PoolClient} client 
 * @param {string?} ui 
 * @returns {PoolClient}
 */
async function configClient(client, uid) {
  if (!uid) {
    return client
  }
  await client.query(`SET auth.uid='${uid}';`)
  return client
}
