import PlayWebUI, { View } from "play-web-ui";
// import './database.css'


export class DatbaseEditPage extends View {
    /** @type {AppContext} */
    context

    /** @type {'loading' | 'complete'} */
    status = 'loading'

    /**
     * Initialize with AppContext
     * @param {AppContext} context 
     */
    constructor(context) {
        super(context)
        this.context = context ?? {}
    }

    compile() {
        return (
            <section>
                <h3>Edit Database</h3>
                <div>
                    params: {'{'}
                    <br />
                    &nbsp; &nbsp; &nbsp; {() => `${Object.entries(this.context.route.params).map(([key, value]) => `${key} : ${value}`)}`}
                    <br />
                    {'}'}
                    <br />
                    query: {'{'}
                    <br />
                    &nbsp; &nbsp; &nbsp; {() => `${Object.entries(this.context.route.query).map(([key, value]) => `${key} : ${value}`)}`}
                    <br />
                    {'}'}
                </div>

            </section>
        )
    }

    async didRender(props) {
        const { authToken, route } = this.context
        const tables = await getTables(authToken, route.params.id)
        console.log('tables', tables)
        // Combine columbs by tables
        const returnData = {}
        for (let i = 0; i < tables.length; i++) {
            const columnData = tables[i]
            const { table_name, ...otherData } = columnData
            const curTableData = returnData[table_name] ?? {}
            const columnInfo = otherData
            returnData[table_name] = columnInfo
        }
        console.log('data', returnData)
        const pre = document.createElement('pre')
        pre.innerHTML = JSON.stringify(returnData, null, "\t")
        this.domEl.append(pre)
    }

    onGoogleClick() {
        console.log('clicked')
    }
}
/**
 * Gets DB
 * @param {string} authToken 
 * @param {string} dbId 
 * @returns {Promise<[Object]?>} array of db objects
 */
async function getTables(authToken, dbId) {
    console.log('authToken', authToken)

    // const testEndPoint = 'https://us-central1-oneshot-c5e23.cloudfunctions.net/userAdmin/db'
    const testEndPoint = `http://127.0.0.1:5001/oneshot-c5e23/us-central1/userAdmin/db/${dbId}`

    try {
        // Fetch DB list
        const resp = await fetch(testEndPoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        })

        // Http error
        if (!resp.ok) {
            if (resp.status == 401) {
                // window.location = '/signout'
            }
            throw new Error(`HTTP error! status: ${resp.json()}`);
        }

        // Show list
        const json = await resp.json()
        console.log('json', json)
        return json.data ?? []

    }
    catch (error) {
        console.error('Error GettingDB:', error);
    }
}


export default DatbaseEditPage
