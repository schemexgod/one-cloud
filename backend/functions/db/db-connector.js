
import { Connector } from '@google-cloud/cloud-sql-connector';
import { Pool } from 'pg';
// import { Connector } from '@google-cloud/cloud-sql-connector';

/** @type {Pool?} */
let dbPool

/**
 * Gets a PoolClient from the DB Pool 
 * @returns {PoolClient}
 */
export const dbClient = async () => {
  if (dbPool) {
    return dbPool.connect()
  }

  const connector = new Connector()
  const clientOpts = await connector.getOptions({
    instanceConnectionName: 'oneshot-c5e23:us-central1:one-shot',
    authType: 'PASSWORD'
  });

  // TODO: Put credentials in google secrets
  const pool = new Pool({
    ...clientOpts,
    user: 'postgres',
    password: 'Oneshot123!',
    // host: '10.124.144.3', // Private IP of your Cloud SQL instance
    database: 'app',
    port: 5432,
  });
  return dbPool.connect()
}
