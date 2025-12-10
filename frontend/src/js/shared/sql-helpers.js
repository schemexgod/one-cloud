/**
 * Runs a sql command
 * @param {string} authToken 
 * @param {string} command sql command 
 * @returns {Promise<[Object]?>} array of db objects
 */
export async function runSql(authToken, dbId, command) {
    console.log('authToken', authToken)

    // const testEndPoint = 'https://us-central1-oneshot-c5e23.cloudfunctions.net/userAdmin/db'
    const testEndPoint = `http://127.0.0.1:5001/oneshot-c5e23/us-central1/userAdmin/sql/${dbId}`

    try {
        // Fetch DB list
        const resp = await fetch(testEndPoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                sqlCmd: command
            })

        })

        // Http error
        if (!resp.ok) {
            if (resp.status == 401) {
                // window.location = '/signout'
            }
            const json = await resp.json()
            throw new Error(json.error);
        }

        // Show list
        const json = await resp.json()
        console.log('json', json)
        return json.data ?? []

    }
    catch (error) {
        console.error('Error GettingDB:', error);
        throw error
    }
}
