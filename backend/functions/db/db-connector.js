
import { Pool } from 'pg';
// import { Connector } from '@google-cloud/cloud-sql-connector';

/** @type {Pool?} */
let dbPool

/**
 * Gets a PoolClient from the DB Pool 
 * @returns {PoolClient}
 */
export const dbClient = () => {
  if (dbPool) {
    return dbPool.connect()
  }

  // TODO: Put credentials in google secrets
  dbPool = new Pool({
    user: 'postgres',
    password: 'Oneshot123!',
    host: '10.124.144.3', // Private IP of your Cloud SQL instance
    // database: 'postgres',
    port: 5432,
  });

  return dbPool.connect()
}