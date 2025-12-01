import PlayWebUI, { View, prop } from "play-web-ui";
import './database.scss'
import { runSql } from "../../shared/sql-helpers";

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

  /**
   * Initialize with AppContext
   * @param {AppContext} context 
   */
  constructor(context) {
    super(context)
    this.context = context ?? {}
    this._fetchRecords()
  }

  compile() {
    return (
      <section id="db-section">
        <nav>

          <h3>DB Records "{() => { return this.context.route.params.tableId }}"</h3>
          <a onClick={this.onAddClick}>Add Record</a>
        </nav>
        <ul class="list">
          {/** List goes here */}
        </ul>
      </section>
    )
  }
  onAddClick() {

  }
  didRender(props) {
    console.log('db page', this.domEl, props)
    this._fetchRecords()
  }

  renderDBList() {
    /** @type {HTMLElement} */
    const listEl = this.domEl.querySelector('.list')
    if (!listEl) { return }

    if (this.dbList.length === 0) {
      listEl.textContent = 'No entries found'
      return
    }

    const rows = []
    this.dbList.forEach((info, index) => {
      const nDate = (new Date(info.date_created)).toLocaleString()
      const row = this.buildRow(index)
      row.render({ ...info, date: nDate })
      rows.push(row.domEl)
    })
    listEl.replaceChildren(...rows)
  }

  /**
   * @param {number} index
   * @returns {JsxElementInfoType}
   */
  buildRow(index) {
    let row = this.#_rows[index]
    if (row) { return row }

    row = (
      <li class="row">
        <div><a href={(props) => `/databases/${props.id}`}>{prop('name')}</a></div>
        <div>{prop('date')}</div>
        <div><input type="checkbox" /></div>
      </li>
    )

    this.#_rows.push(row)

    return row
  }

  async _fetchRecords() {
    this.status = 'loading'
    this.domEl.querySelector('.list').textContent = 'loading...'
    console.log('fetching db', this.context)

    const { authToken, route } = this.context
    const tableName = decodeURI(route.params.tableId)

    const query = `SELECT * FROM "${tableName}"`
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

    this.status = 'complete'
    this.renderDBList()
  }
}

/**
 * Gets DB
 * @param {string} authToken 
 * @returns {Promise<[Object]?>} array of db objects
 */
async function getDatabases(authToken) {
  console.log('authToken', authToken)

  // const testEndPoint = 'https://us-central1-oneshot-c5e23.cloudfunctions.net/userAdmin/db'
  const testEndPoint = 'http://127.0.0.1:5001/oneshot-c5e23/us-central1/userAdmin/db'

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
