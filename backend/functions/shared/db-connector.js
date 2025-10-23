
import { Pool } from 'pg';
import { Connector } from '@google-cloud/cloud-sql-connector';

// const getDB = async (db) => {

//     const connector = new Connector();
//     try {
      
//       const pool = new Pool({
//         user: 'postgres',
//         password: 'Oneshot123!',
//         host: '10.124.144.3', // Private IP of your Cloud SQL instance
//         // database: 'test-cloud-func',
//         port: 5432,
//       });

//       const { rows } = await pool.query('SELECT NOW()');
//       res.status(200)
//         .json({
//           data: rows,
//         })

//       await pool.end();
//       connector.close();

//     } catch (error) {
//       res.status(500)
//         .json({ error: error, otherMsg: otherMsg })
//     }
// }