import PlayWebUI, { View } from "play-web-ui";
import './database.scss'
import { runSql } from "../../shared/sql-helpers";

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

const columnTypes = [
    'INTEGER',
    'VARCHAR',
    // 'VARCHAR(50)',
    // 'VARCHAR(100)',
    // 'VARCHAR(255)',
    'TEXT',
    // 'DECIMAL(10,2)',
    'BOOLEAN',
    'DATE',
    'TIMESTAMP',
    // 'FLOAT',
    'DOUBLE',
    'BIGINT',
    // 'SMALLINT',
    // 'CHAR(10)',
    'JSON',
    // 'BLOB'
];

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
        this.onDeleteClick = this.onDeleteClick.bind(this)
        this.onCreateColumnClick = this.onCreateColumnClick.bind(this)
        this.onCreateTableClick = this.onCreateTableClick.bind(this)
        this.onFKMouseEnter = this.onFKMouseEnter.bind(this)
        this.onFKMouseLeave = this.onFKMouseLeave.bind(this)
        this.onSetPKClick = this.onSetPKClick.bind(this)
        this.onRunSqlClick = this.onRunSqlClick.bind(this)
    }

    compile() {
        return (
            <section>
                <h2>Edit Database</h2>
                <div class="table-selector">
                    <label for="tableSelect">Run SQL Command:</label>
                    <textarea name="sqlCmd" />
                    <button class="add-btn" onClick={this.onRunSqlClick}>Run</button>
                </div>
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
        // const pre = document.createElement('pre')
        // pre.innerHTML = JSON.stringify(resultTables, null, "  ")
        // this.domEl.append(pre)
        this.tableData = resultTables
        this._loadTableViews()
    }
    async onRunSqlClick() {
        const sqlCmd = (this.domEl.querySelector('[name="sqlCmd"]').value ?? '').trim()
        if (!sqlCmd) { return }
        
        try {
            const res = await runSql(this.context.authToken, this.context.route.params.id, sqlCmd)
            console.log('res', res)
            alert('Complete!')
        } catch (error) {
            console.log('eeeeee', error)
            alert(`Error: \n\n${error.message}`)
        }
    }
    onFKMouseEnter(event) {
        const target = event.currentTarget
        const table = target.dataset.fkTable
        const column = target.dataset.fkColumn
        const foreignRowEl = this.domEl.querySelector(`.table-card[data-table="${table}"] .column-row[data-column="${column}"]`)
        console.log('----', table, column, foreignRowEl)
        foreignRowEl.style.backgroundColor = 'rgba(0, 119, 255, 0.2)'

    }
    onFKMouseLeave(event) {
        const target = event.currentTarget
        const table = target.dataset.fkTable
        const column = target.dataset.fkColumn
        const foreignRowEl = this.domEl.querySelector(`.table-card[data-table="${table}"] .column-row[data-column="${column}"]`)
        console.log('----', table, column, foreignRowEl)
        foreignRowEl.style.backgroundColor = null

    }
    async onCreateTableClick(event) {
        const tableName = document.getElementById('new-table-name').value.trim()
        if (!tableName || tableName.length == 0) { return }

        const query = `CREATE TABLE "${tableName}" (id SERIAL PRIMARY KEY)`
        console.log('sql command ::', query)

        try {
            const res = await runSql(this.context.authToken, this.context.route.params.id, query)
            console.log('res', res)
            this.tableData[tableName] = { columns: [] }
        } catch (error) {
            console.log('eeeeee', error)
            alert(`Error: \n\n${error.message}`)
            target.value = prevType
        }
    }

    /**
     * 
     * @param {Event} event 
     */
    async onTypeClick(event) {
        /** @type {HTMLElement} */
        const target = event.currentTarget
        const optionEl = target.options[target.selectedIndex]
        console.log('type click', target.dataset.column)
        const table = optionEl.dataset.table
        const column = optionEl.dataset.column
        const prevType = target.dataset.prevValue
        let newType = target.value

        // Check if we need additional info
        if (newType == 'varchar') {
            let length = prompt("Enter length of VARCHAR:");
            length = parseInt(length)
            if (!length || length <= 0) {
                alert('Invalid number!')
                target.value = prevType
                return
            }
            newType += `(${length})`
        }

        const query = `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE ${newType}`

        // Check if we need conversion
        // if()


        console.log('sql command ::', query, prevType)
        try {
            const res = await runSql(this.context.authToken, this.context.route.params.id, query)
            console.log('res', res)
        } catch (error) {
            console.log('eeeeee', error)
            alert(`Error: \n\n${error.message}`)
            target.value = prevType
        }
    }

    async onDeleteClick(event) {
        let userConfirmed = confirm("Are you sure you want to delete this item?");
        if (!userConfirmed) { return }

        const target = event.currentTarget
        const table = target.dataset.table
        const column = target.dataset.column
        const query = `ALTER TABLE "${table}" DROP COLUMN "${column}"`

        console.log('sql command ::', query)
        /** @type {HTMLElement} */
        const rowEl = target.closest('.column-row')
        rowEl.style.display = 'none'
        try {
            const res = await runSql(this.context.authToken, this.context.route.params.id, query)
            console.log('res', res)
            rowEl?.remove()
            this.tableData[table].columns = this.tableData[table].columns.filter((el) => {
                return el.name != column
            })
        } catch (error) {
            console.log('eeeeee', error)
            alert(`Error: \n\n${error.message}`)
            rowEl.style.display = undefined

        }
    }

    async onCreateColumnClick(event) {
        const target = event.currentTarget
        const parent = target.closest('.add-column-form')
        const table = parent.dataset.table
        const column = parent.querySelector('.add-column-name').value
        let newType = parent.querySelector('.add-column-type').value

        if (!(table && column && newType)) {
            alert('Missing info')
            return
        }
        if (newType == "DOUBLE") {
            newType += " PRECISION"
        }
        const query = `ALTER TABLE "${table}" ADD COLUMN "${column}" ${newType}`

        try {
            const res = await runSql(this.context.authToken, this.context.route.params.id, query)
            console.log('res', res)
            this.tableData[table].columns.push({ name: column, type: newType, not_null: false })
            this._loadTableViews()
        } catch (error) {
            console.log('eeeeee', error)
            alert(`Error: \n\n${error.message}`)
        }

    }

    async onSetPKClick(event) {
        const target = event.currentTarget
        const column = target.closest('.column-row').dataset.column
        const table = target.closest('.table-card').dataset.table

        const query = `ALTER TABLE "${table}" ADD CONSTRAINT "${table}_pkey" PRIMARY KEY (${column});`
        console.log('query', query)
        try {
            const res = await runSql(this.context.authToken, this.context.route.params.id, query)
            console.log('res', res)
            this.tableData[table].constraints = this.tableData[table].constraints.filter((cur) => {
                return cur.constraint_type != 'p'
            })
            this.tableData[table].constraints.push({ column_names: column, constraint_type: 'p' })
            this._loadTableViews()

        } catch (error) {
            console.log('eeeeee', error)
            alert(`Error: \n\n${error.message}`)

        }
    }

    _loadTableViews() {
        console.log("--", this.tableData)
        const len = this.tableData

        var nodes = []
        for (let key in this.tableData) {

            const curInfo = this.tableData[key]

            // Check for Keys and Constraints
            let primaryKeyCol
            let foreignKeys = {}
            for (let info of curInfo.constraints) {
                if (info.constraint_type == 'p') {
                    primaryKeyCol = info.column_names
                }
                else if (info.constraint_type == 'f') {
                    foreignKeys[info.column_names] = { table: info.foreign_table_name, column: info.foreign_column_names }
                }
            }

            const headerEls = (
                <div class="table-card" data-table={key}>
                    <div class="table-header">
                        <h3>{key}</h3>
                        <a href={`/databases/${this.context.route.params.id}/${key}`}>{curInfo.rowCount} Entries</a>
                    </div>
                    <div class="columns-list"></div>
                    <div class="add-column-section">
                        <div class="add-column-form" data-table={key}>
                            <input type="text" placeholder="Column name..." class="add-column-name" />
                            <select class="add-column-type">
                                <option value="INTEGER">INTEGER</option>
                                <option value="VARCHAR(50)">VARCHAR(50)</option>
                                <option value="VARCHAR(100)">VARCHAR(100)</option>
                                <option value="VARCHAR(255)">VARCHAR(255)</option>
                                <option value="TEXT">TEXT</option>
                                <option value="DECIMAL(10,2)">DECIMAL(10,2)</option>
                                <option value="BOOLEAN">BOOLEAN</option>
                                <option value="DATE">DATE</option>
                                <option value="TIMESTAMP">TIMESTAMP</option>
                                <option value="FLOAT">FLOAT</option>
                                <option value="DOUBLE">DOUBLE</option>
                                <option value="BIGINT">BIGINT</option>
                                <option value="SMALLINT">SMALLINT</option>
                                <option value="CHAR(10)">CHAR(10)</option>
                                <option value="JSON">JSON</option>
                                <option value="BLOB">BLOB</option>
                            </select>
                            <button class="add-btn" onClick={this.onCreateColumnClick}>+ Add Column</button>
                        </div>
                    </div>
                </div>
            )
            nodes.push(headerEls.domEl)
            const listEl = headerEls.domEl.querySelector('.columns-list')
            curInfo.columns.forEach((curColumn) => {
                const foreignColumn = foreignKeys[curColumn.name]
                const newEl = (
                    <div class="column-row" data-column={curColumn.name}>
                        <span class="column-name">
                            <span>{curColumn.name}</span>
                            {primaryKeyCol == curColumn.name ? (
                                <span
                                    class="pk-badge"
                                    title="Primary Key - Click to remove">
                                    PK
                                </span>
                            ) : <> </>}

                            {foreignColumn ? (
                                <span
                                    class="fk-badge" title="Foreign Key - Click to remove"
                                    data-fk-table={foreignColumn.table}
                                    data-fk-column={foreignColumn.column}
                                    onMouseEnter={this.onFKMouseEnter}
                                    onMouseLeave={this.onFKMouseLeave}>
                                    FK → {`${foreignColumn.table}.${foreignColumn.column}`}
                                </span>
                            ) : <> </>}

                        </span>
                        {/* <span class="column-type" data-column={curColumn.name} onClick={this.onTypeClick}>{curColumn.type}</span> */}

                        <div class="column-actions">
                            {primaryKeyCol == curColumn.name ? <></> : (
                                <button class="constraint-btn" title="Set as Primary Key" onClick={this.onSetPKClick}>Set PK</button>
                            )}
                            <select class="column-type" onChange={this.onTypeClick}>
                                {columnTypes.map((curType) => {
                                    curType = curType?.toLowerCase()
                                    const isSelected = curColumn.type?.toLowerCase().startsWith(curType)
                                    const label = isSelected ? curColumn.type : curType
                                    return <option value={curType} selected={isSelected} data-table={key} data-column={curColumn.name}>{label}</option>
                                })}
                            </select>
                            <button class="delete-btn" onClick={this.onDeleteClick} data-table={key} data-column={curColumn.name}>✕ Delete</button>
                        </div>
                    </div>
                )

                listEl.append(newEl.domEl)
            })

        }

        const gridEl = this.domEl.querySelector('.tables-grid')
        gridEl.replaceChildren(...nodes)

        document.querySelectorAll('.tables-grid select').forEach((curEl) => {
            curEl.dataset.prevValue = curEl.value
        })


        // Add new table

        const addCell = (
            <div class="add-table-card">
                <h3>➕ Add New Table</h3>
                <div class="add-table-form">
                    <input type="text" placeholder="Enter table name..." id="new-table-name" />
                    <button class="add-table-btn" onClick={this.onCreateTableClick}>Create Table</button>
                </div>
            </div>
        )

        gridEl.append(addCell.domEl)
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
