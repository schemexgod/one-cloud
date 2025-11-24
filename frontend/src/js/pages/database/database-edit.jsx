import PlayWebUI, { View } from "play-web-ui";
import './database.scss'

/** 
 * @typedef {string: DBTableInfo} DBAllTableInfo 
 * 
*/

/** 
 * @typedef DBTableInfo 
 * @property {[DBColumnInfo]} columns
 * 
*/

/** 
 * @typedef DBColumnInfo 
 * @property {string} name column name
 * @property {string} type value type
 * @property {boolean} not_null Whether the value cannot be NULL
*/

export class DatbaseEditPage extends View {
    /** @type {AppContext} */
    context

    /** @type {'loading' | 'complete'} */
    status = 'loading'
    /** */
    tableData

    /**
     * Initialize with AppContext
     * @param {AppContext} context 
     */
    constructor(context) {
        super(context)
        this.context = context ?? {}
        this.onTypeClick = this.onTypeClick.bind(this)
    }

    compile() {
        return (
            <section>
                <h2>Edit Database</h2>
                <div class="section-tables">
                    <div class="tables-grid">
                    </div>
                </div>
            </section>
        )
    }

    async didRender(props) {
        const { authToken, route } = this.context
        const resultTables = await getTables(authToken, route.params.id)

        console.log('tables', resultTables)
        const pre = document.createElement('pre')
        pre.innerHTML = JSON.stringify(resultTables, null, "  ")
        this.domEl.append(pre)
        this.tableData = resultTables
        this._loadTableViews()
    }
    /**
     * 
     * @param {Event} event 
     */
    async onTypeClick(event) {
        /** @type {HTMLElement} */
        const target = event.currentTarget
        console.log('type click', target.dataset.column)
        const res = await runSql(this.context.authToken, this.context.route.params.id, 'SELECT * FROM games')
        console.log('res', res)
    }
    _loadTableViews() {
        console.log("--", this.tableData)
        if (Object.keys(this.tableData).length === 0) {
            this.domEl.querySelector('.tables-grid').textContent = 'No Tables'
            return
        }
        const len = this.tableData

        var nodes = []
        for (let key in this.tableData) {
            const curInfo = this.tableData[key]
            const headerEls = (
                <div class="table-card">
                    <h3 class="table-header">{key}</h3>
                    <div class="columns-list"></div>
                </div>
            )
            nodes.push(headerEls.domEl)
            const listEl = headerEls.domEl.querySelector('.columns-list')
            curInfo.columns.forEach((curColumn) => {
                const newEl = (
                    <div class="column-row">
                        <span class="column-name">{curColumn.name}</span>
                        <span class="column-type" data-column={curColumn.name} onClick={this.onTypeClick}>{curColumn.type}</span>
                    </div>
                )

                listEl.append(newEl.domEl)
            })
            this.domEl.querySelector('.tables-grid').replaceChildren(...nodes)
        }

        // const newEl = (
        //     <div class="table-card">
        //         <h3 class="table-header">orders</h3>
        //         <div class="columns-list">
        //             <div class="column-row"><span class="column-name">prop('id')</span><span class="column-type">INTEGER</span></div>
        //             <div class="column-row"><span class="column-name">user_id</span><span class="column-type">INTEGER</span></div>
        //             <div class="column-row"><span class="column-name">order_date</span><span class="column-type">TIMESTAMP</span></div>
        //             <div class="column-row"><span class="column-name">total_amount</span><span class="column-type">DECIMAL(10,2)</span></div>
        //             <div class="column-row"><span class="column-name">status</span><span class="column-type">VARCHAR(20)</span></div>
        //         </div>
        //     </div>
        // )

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

/**
 * Runs a sql command
 * @param {string} authToken 
 * @param {string} command sql command 
 * @returns {Promise<[Object]?>} array of db objects
 */
async function runSql(authToken, dbId, command) {
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
