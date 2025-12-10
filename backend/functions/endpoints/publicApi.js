/**
 * Functions to publicly access a Users backend db and services. 
 * This is their public api they use in their real world app 
 */

import { onRequest } from "firebase-functions/v2/https";
import { createDatabase, getDatabase, getTables, hasAccess, runSql } from "../db/db-functions.js";
import { getUserOrFail } from "../auth/user-db-admin.js";
import { AppError } from "../common/AppError.js";
import { dbClient } from "../db/db-connector.js";

export const api = onRequest({
    cors: '*',
    timeoutSeconds: 300
},
    async (req, res) => {
        let reqPath = req.path
        if (reqPath.startsWith('/')) {
            reqPath = reqPath.slice(1)
        }

        const [dbId, apiRoute] = reqPath.split(/\/(.*)/s);

        // If no project and route found
        if (!dbId || !apiRoute) {
            return res.status(404).json({ error: 'Invalid endpoint' })
        }

        // Get the api routes

    })

export const sql = onRequest({
    cors: '*',
    timeoutSeconds: 300
},
    async (req, res) => {
        let reqPath = decodeURIComponent(req.path)
        if (reqPath.startsWith('/')) {
            reqPath = reqPath.slice(1)
        }

        let [dbId, sqlCmd] = reqPath.split(/\/(.*)/s);

        // If no project and route found
        if (!dbId || !sqlCmd) {
            return res.status(404).json({ error: 'Invalid endpoint', dd: `${dbId}, ${sqlCmd}`, dd2: `${reqPath}`, })
        }

        // Get the api routes
        return await _processSqlEndpoint(dbId, sqlCmd, req, res)
    })


const _processSqlEndpoint = async (dbId, sqlCmd, req, res) => {
    try {
        if (!dbId) {
            throw new AppError('Missing database id', 404)
        }
        dbId = decodeURIComponent(dbId)
        // const user = await getUserOrFail(req, res)
        // if (!user) {
        //     throw new AppError('Not signed in')
        // }
        // const isAllowed = hasAccess(user.uid, dbId)
        // if (!isAllowed) {
        //     throw new AppError('Access not allowed', 501)
        // }
        const user = {}
        const result = await runSql(user, dbId, sqlCmd)

        return res.status(200).json({ data: result.rows ?? [] })
    }
    catch (error) {
        // return res.status(200).json({work: 's', error})
        return res.status(error.code ?? 500).json({ error: error.message ?? 'Unknown error' })
    }

}



// TODO: make get user and auth check the specific project Auth
