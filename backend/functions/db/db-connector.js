
import { Connector } from '@google-cloud/cloud-sql-connector';
import { Pool } from 'pg';
// import { Connector } from '@google-cloud/cloud-sql-connector';

/** @type {Object.<string, Pool>} */
let dbPool = {}

/**
 * Gets a PoolClient from the DB Pool 
 * @param {string} dbName Name of the database to connect to. Default is `app`
 * @param {string?} uid optionally set the `auth.uid()`
 * @returns {Promise<PoolClient>}
 */
export const dbClient = async (dbId = 'app', uid) => {
  let pool = dbPool[dbId]
  if (pool) {
    return configClient(await pool.connect(), uid)
  }

  const connector = new Connector()
  const clientOpts = await connector.getOptions({
    instanceConnectionName: 'oneshot-c5e23:us-central1:one-shot',
    authType: 'PASSWORD'
  });

  // TODO: Put credentials in google secrets
  pool = new Pool({
    ...clientOpts,
    user: 'postgres',
    password: 'Oneshot123!',
    // host: '10.124.144.3', // Private IP of your Cloud SQL instance
    database: dbId,
    port: 5432,
  });
  dbPool[dbId] = pool

  return configClient(await pool.connect(), uid)
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
