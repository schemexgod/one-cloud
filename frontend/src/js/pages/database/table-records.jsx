import PlayWebUI, { View, prop } from "play-web-ui";
import './database.scss'
import './table-records.scss'
import { runSql } from "../../shared/sql-helpers";
import { debounce } from "../../shared/utils";

/** @typedef {import("../../play-web-ui/src/play-types").JsxElementInfoType} JsxElementInfoType */

export class TableRecordsPage extends View {
  /** @type {AppContext} */
  context

  /** @type {'loading' | 'complete'} */
  status = 'loading'

  /** @type {[object]} */
  dbList = []

  /** @type {[JsxElementInfoType]} */
  #_rows = []

  #_tableSchema = {}

  debouncedUpdateRowData

  /**
   * Initialize with AppContext
   * @param {AppContext} context 
   */
  constructor(context) {
    super(context)
    this.updateRowData = this.updateRowData.bind(this)
    this.onRowDataChange = this.onRowDataChange.bind(this)
    this.onDeleteClick = this.onDeleteClick.bind(this)
    this.onAddRowSubmit = this.onAddRowSubmit.bind(this)
    this.onAddClick = this.onAddClick.bind(this)
    this.onCancelAddClick = this.onCancelAddClick.bind(this)
    this.context = context ?? {}
    this.debouncedUpdateRowData = debounce(this.updateRowData, 300);
    this.domEl.querySelector('.data-container').style.display = 'none'
    this._fetchRecords()
  }

  compile() {
    return (
      <section id="db-section">
        <div class="loading">Loading...</div>

        <div class="data-container" id="dataContainer" style="display: block;">
          <div class="table-header">
            <div>
              <span id="tableName">{() => { return this.context.route.params.tableId }}</span>
              <span class="row-count" id="rowCount">{() => { return this.#_tableSchema.rowCount }} rows</span>
            </div>
            <button class="add-row-btn" onclick={this.onAddClick}>+ Add Row</button>
          </div>
          <div class="table-wrapper">
            <table id="dataTable">
              <thead id="tableHead">
                <tr>
                  <th>id</th>
                  <th>username</th>
                  <th>email</th>
                  <th>created_at</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="tableBody">
                <tr>
                  <td>1</td>
                  <td>john_doe</td>
                  <td>john@example.com</td>
                  <td>2024-01-15 10:30:00</td>
                  <td>
                    <button class="delete-btn">✕ Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div id="addRowModal" class="modal">
          <div class="modal-content">
            <div class="modal-content-scroll">
              <h2>Add New Row</h2>
              <form id="addRowForm">
                <div class="form-group">
                  <label>id (INTEGER)</label>
                  <input type="number" id="input-id" name="id" />
                </div>

              </form>
              <div class="modal-buttons">
                <button class="modal-btn secondary" onclick={this.onCancelAddClick}>Cancel</button>
                <button class="modal-btn primary" onclick={this.onAddRowSubmit}>Add Row</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }
  async onAddRowSubmit() {
    const formInputs = document.querySelectorAll('#addRowForm input')
    if (formInputs.length == 0) {
      alert(`Error: Cannot find form info!`)
    }

    const { authToken, route } = this.context
    const tableName = decodeURI(route.params.tableId)

    let columnStr = ''
    let valueStr = ''

    // Loop through inputs and for query
    formInputs.forEach((curInput) => {
      const value = curInput.value
      if (!value || value.length == 0) {
        return
      }
      columnStr += `"${curInput.name}", `
      valueStr += `'${curInput.value}', `
      console.log('form input', curInput.name, curInput.value)
    })

    if (columnStr.length < 2) {
      alert(`Error: Fill out form!`)
      return
    }

    columnStr = columnStr.slice(0, -2)
    valueStr = valueStr.slice(0, -2)

    const queryStr = `INSERT INTO "${tableName}" (${columnStr}) VALUES (${valueStr})`
    console.log('-- insert query ::', queryStr)
    try {
      const res = await runSql(authToken, route.params.id, queryStr)
      console.log('res', res)
      console.log('tables', res)
      console.log('fetching db result', res)
      // this.dbList = res

      this.domEl.querySelector('#addRowModal').classList.remove('active')
    }
    catch (error) {
      console.log('eeeeee', error)
      alert(`Error: \n\n${error.message}`)
    }
  }
  onAddClick() {
    console.log('this', this, this.domEl)
    this.domEl.querySelector('#addRowModal').classList.add('active')
  }
  onCancelAddClick() {
    this.domEl.querySelector('#addRowModal').classList.remove('active')
  }
  didRender(props) {
    console.log('table records page', this.domEl, props)
    // this._fetchRecords()
  }

  async _fetchRecords() {
    this.status = 'loading'
    console.log('fetching db', this.context)

    const { authToken, route } = this.context
    const tableName = decodeURI(route.params.tableId)

    // Get table schema    
    try {
      const res = await getTableSchema(authToken, route.params.id, tableName)
      const tableSchema = res[tableName]

      if (!tableSchema) {
        throw new Error('No table schema found!')
      }
      console.log('table schema', res)
      this.#_tableSchema = tableSchema

    }
    catch (error) {
      console.log('eeeeee', error)
      alert(`Error: \n\n${error.message}`)
      return
    }

    this.domEl.querySelector('#rowCount').textContent = `${this.#_tableSchema.rowCount} rows`


    // Build Column Headers & Add Row Form
    const headerRowEl = this.domEl.querySelector('#tableHead > tr')
    const formEl = this.domEl.querySelector('#addRowForm')
    const newEls = []
    const newFormEls = []
    this.#_tableSchema.columns.forEach((curCol) => {
      newEls.push((<th>{curCol.name}</th>).domEl)
      newFormEls.push((
        <div class="form-group">
          <label>{curCol.name} ({curCol.type})</label>
          <input type="text" name={curCol.name} />
        </div>
      ).domEl)
    })
    newEls.push((<th>Actions</th>).domEl)
    headerRowEl.replaceChildren(...newEls)
    formEl.replaceChildren(...newFormEls)

    // Show table data
    const tableBodyEl = this.domEl.querySelector('#tableBody')
    tableBodyEl.replaceChildren((<tr><td colspan={this.#_tableSchema.columns.length ?? 1}>Loading...</td></tr>).domEl)
    this.domEl.querySelector('.data-container').style.display = null
    this.domEl.querySelector('.loading').style.display = 'none'

    // Get Rows
    const query = `SELECT ctid, * FROM "${tableName}"`
    console.log('sql command ::', query)

    try {
      const res = await runSql(authToken, route.params.id, query)
      console.log('res', res)
      console.log('tables', res)
      console.log('fetching db result', res)
      this.dbList = res

    }
    catch (error) {
      console.log('eeeeee', error)
      alert(`Error: \n\n${error.message}`)
    }

    if (this.dbList.length == 0) {
      tableBodyEl.replaceChildren((<tr><td colspan={this.#_tableSchema.columns.length ?? 1}>No Rows!</td></tr>).domEl)
    }
    else {
      // Build rows
      const rowEls = []
      this.dbList.forEach((curRow) => {
        const rows = this.#_tableSchema.columns.map((curCol) => {
          const colName = curCol.name
          return ((<td><div contenteditable="true" data-ctid={curRow.ctid} data-column-name={colName} onblur={this.onRowDataChange} onKeyDown={this.onKeyDown}>{curRow[colName] ?? ''}</div></td>))
        })

        rowEls.push((
          <tr>
            {rows}
            <td>
              <button class="delete-btn" data-ctid={curRow.ctid} onClick={this.onDeleteClick}>✕ Delete</button>
            </td>
          </tr>
        ).domEl)
      })

      tableBodyEl.replaceChildren(...rowEls)
    }


    this.status = 'complete'
    // this.renderDBList()
  }

  onKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default form submission
      event.currentTarget.blur()      
    }
  }

  onRowDataChange(event) {
    const target = event.currentTarget
    const data = target.dataset
    console.log('-- change', data.ctid, data.columnName, target.textContent)
    this.debouncedUpdateRowData(data.ctid, data.columnName, target.textContent)
  }

  async updateRowData(ctid, columnName, value) {
    console.log('-- updateRowData', ctid, columnName, value)

    const { authToken, route } = this.context
    const tableName = decodeURI(route.params.tableId)

    const query = `UPDATE "${tableName}" SET "${columnName}" = '${value}' WHERE ctid = '${ctid}'`
    console.log('sql command ::', query)

    try {
      const res = await runSql(authToken, route.params.id, query)
      console.log('UPDATE', res)

    }
    catch (error) {
      console.log('eeeeee UPDATE', error)
      alert(`Error: \n\n${error.message}`)
    }

  }

  async onDeleteClick(event) {
    const deletBtnEl = event.currentTarget
    const ctid = deletBtnEl.dataset.ctid

    let userConfirmed = confirm("Are you sure you want to delete this item?");
    if (!userConfirmed) { return }

    const { authToken, route } = this.context
    const tableName = decodeURI(route.params.tableId)
    const query = `DELETE FROM "${tableName}" WHERE ctid = '${ctid}';`
    const res = await runSql(authToken, route.params.id, query)
    await this._fetchRecords()
  }
}

/**
 * Gets DB
 * @param {string} authToken 
 * @returns {Promise<[Object]?>} array of db objects
 */
async function getTableSchema(authToken, dbId, tableId) {
  console.log('authToken', authToken)

  // const testEndPoint = 'https://us-central1-oneshot-c5e23.cloudfunctions.net/userAdmin/db'
  const testEndPoint = `http://127.0.0.1:5001/oneshot-c5e23/us-central1/userAdmin/db/${dbId}/${tableId}`

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

export default TableRecordsPage
