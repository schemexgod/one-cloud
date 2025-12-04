import PlayWebUI, { View, prop } from "play-web-ui";
import './database.scss'

/** @typedef {import("../../play-web-ui/src/play-types").JsxElementInfoType} JsxElementInfoType */

export class DatabasePage extends View {
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
    this.onDeleteAllClick = this.onDeleteAllClick.bind(this)
    this.onAddDBClick = this.onAddDBClick.bind(this)
    this.context = context ?? {}
    this._fetchUserDBs()
  }

  async onDeleteAllClick(evt) {
    evt.preventDefault()
    evt.stopImmediatePropagation()
    if (!confirm('Are you sure you want to delete all databases?')) { return }
    await deleteAllDatabases(this.context.authToken)
    this._fetchUserDBs()
  }


  async onAddDBClick(evt) {
    evt.preventDefault()
    evt.stopImmediatePropagation()
    let name = prompt("Please enter your DB Name:")
    console.log("NAME", name, name.length)
    if (name == null) {
      return
    }

    name = name.trim()

    if (name.length == 0) {
      console.log("NAME", name)
      alert('No name was entered!')
      return
    }
    createDatabase(this.context.authToken, name)
  }

  compile() {
    return (
      <section id="db-section">
        <nav>
          <h3>Databases</h3><a href="#" onClick={this.onAddDBClick}>Add DB</a><a href="#" onClick={this.onDeleteAllClick}>Delete All</a>
        </nav>
        <ul class="list">
          {/** List goes here */}
        </ul>
      </section>
    )
  }

  didRender(props) {
    console.log('db page', this.domEl, props)
    this._fetchUserDBs()
  }

  renderDBList() {
    /** @type {HTMLElement} */
    const listEl = this.domEl.querySelector('.list')
    if (!listEl) { return }

    if (this.dbList.length === 0) {
      listEl.textContent = 'No databases found'
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

  async _fetchUserDBs() {
    this.status = 'loading'
    this.domEl.querySelector('.list').textContent = 'loading...'
    console.log('fetching db', this.context)
    const result = await getDatabases(this.context.authToken)
    console.log('fetching db result', result)
    this.status = 'complete'
    this.dbList = result
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

/**
 * Gets DB
 * @param {string} authToken 
 * @returns {Promise<[Object]?>} array of db objects
 */
async function deleteAllDatabases(authToken) {
  console.log('authToken', authToken)

  // const testEndPoint = 'https://us-central1-oneshot-c5e23.cloudfunctions.net/userAdmin/db'
  const testEndPoint = 'http://127.0.0.1:5001/oneshot-c5e23/us-central1/userAdmin/db'

  try {
    // Fetch DB list
    const resp = await fetch(testEndPoint, {
      method: 'DELETE',
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
 * Gets DB
 * @param {string} authToken 
 * @returns {Promise<[Object]?>} array of db objects
 */
async function createDatabase(authToken, name) {
  console.log('authToken', authToken)

  // const testEndPoint = 'https://us-central1-oneshot-c5e23.cloudfunctions.net/userAdmin/db'
  const testEndPoint = 'http://127.0.0.1:5001/oneshot-c5e23/us-central1/userAdmin/db'

  try {
    // Fetch DB list
    const resp = await fetch(testEndPoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        displayName: name
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

export default DatabasePage
