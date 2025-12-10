import { onRequest } from "firebase-functions/v2/https";
import { createDatabase, deleteAllDB, getDatabase, getTables, hasAccess, runSql } from "../db/db-functions.js";
import { getUserOrFail } from "../auth/user-db-admin.js";
import { AppError } from "../common/AppError.js";

/**
 * All functions for User's Admin of their projects and account. (ex: CRUD Database, Auth, Storage)
 */
export const userAdmin = onRequest({
    cors: '*',
    timeoutSeconds: 300
},
    async (req, res) => {
        let reqPath = req.path
        if (reqPath.startsWith('/')) {
            reqPath = reqPath.slice(1)
        }

        const pathParts = reqPath.split('/')
        const rootEndpoint = pathParts[0]

        // TODO: Separate by request types vs endpoints. Might be better easier for pointing to read replicas

        switch (rootEndpoint) {
            case 'db':
                return _processDBEndpoint(pathParts, req, res)
            case 'sql':
                return _processSqlEndpoint(pathParts, req, res)
        }

        return res.status(404).json({ error: 'Endpoint not found' })
    })

const _processSqlEndpoint = async (pathParts, req, res) => {
    try {
        let dbId = pathParts[1]
        if (!dbId) {
            throw new AppError('Missing database id', 404)
        }
        dbId = decodeURIComponent(dbId)
        const user = await getUserOrFail(req, res)
        if (!user) {
            throw new AppError('Not signed in')
        }
        const isAllowed = hasAccess(user.uid, dbId)
        if (!isAllowed) {
            throw new AppError('Access not allowed', 501)
        }
        const result = await runSql(user, dbId, req.body.sqlCmd)

        return res.status(200).json({ data: result.rows ?? [] })
    }
    catch (error) {
        // return res.status(200).json({work: 's', error})
        return res.status(error.code ?? 500).json({ error: error.message ?? 'Unknown error' })
    }

}

const _processDBEndpoint = async (pathParts, req, res) => {
    const reqMethod = req.method.toUpperCase()
    let dbId = pathParts[1]

    // If no DB specified then get all databases or create one
    if (!dbId) {
        switch (reqMethod) {
            case 'POST':
                return createDatabase(req, res)
            case 'GET':
                return getDatabase(req, res)
            case 'DELETE':

                // TODO
                return deleteAllDB(req, res)
                return getDatabase(req, res)
        }
    }
    // Handle specific DB 
    else {
        dbId = decodeURIComponent(dbId)

        // Check if specific table is requested
        const processTable = _processDBTableEndpoint(pathParts, req, res)
        if (processTable) {
            return processTable
        }

        // No table specified
        switch (reqMethod) {
            case 'POST':
                // return createDatabase(req, res)
                return

            // Get database schema
            case 'GET':
                return getTables(req, res, dbId)

            case 'DELETE':
                return
            // return getDatabase(req, res)
        }

    }
}

const _processDBTableEndpoint = (pathParts, req, res) => {
    const reqMethod = req.method.toUpperCase()
    let dbId = pathParts[1]
    let tableId = pathParts[2]

    // Exit if no db or table id
    if (!(dbId && tableId)) {
        return
    }
    dbId = decodeURIComponent(dbId)
    tableId = decodeURIComponent(tableId)

    switch (reqMethod) {
        case 'GET':
            return getTables(req, res, dbId, tableId)
        // Alter table
        case 'PATCH', 'POST', 'PUT':
            return
    }

}
