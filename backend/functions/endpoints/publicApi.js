/**
 * Functions to publicly access a Users backend db and services. 
 * This is their public api they use in their real world app 
 */

import { onRequest } from "firebase-functions/v2/https";
import { createDatabase, getDatabase, getTables, hasAccess, runSql } from "../db/db-functions.js";
import { getUserOrFail } from "../auth/user-db-admin.js";
import { AppError } from "../common/AppError.js";

export const api = onRequest({
    cors: '*',
    timeoutSeconds: 300
},
    async (req, res) => {
        let reqPath = req.path
        if (reqPath.startsWith('/')) {
            reqPath = reqPath.slice(1)
        }

        const [dbId, apiRoute] = str.split(/,(.*)/s);

        // If no project and route found
        if (!dbId || !apiRoute) {
            return res.status(404).json({ error: 'Invalid endpoint' })
        }

        // Get the api routes
         
    })