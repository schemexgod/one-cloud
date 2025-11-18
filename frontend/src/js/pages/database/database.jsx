import PlayWebUI, { View } from "play-web-ui";
import './database.css' 


export class DatabasePage extends View {
  /** @type {AppContext} */
  context

  /** @type {'loading' | 'complete'} */
  status = 'loading'

  /** @type {[object]} */
  dbList = []

  /**
   * Initialize with AppContext
   * @param {AppContext} context 
   */
  constructor(context) {
    super(context)
    this.context = context ?? {}
    this._fetchUserDBs()
  }

  compile() {
    return (
      <section id="db-section">
        <h1>Databases</h1>
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

    let html = ''
    this.dbList.forEach((info) => {
      const nDate = (new Date(info.date_created)).toLocaleString()
      html += `<li class="row"><div>${info.name}</div><div>${nDate}</div></li>`
    })
    listEl.innerHTML = html
  }




  async _fetchUserDBs() {
    this.status = 'loading'
    console.log('fetching db', this.context)
    const result = await getDatabases(this.context.authToken)
    console.log('fetching db result', result)
    this.status = 'complate'
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

export default DatabasePage


// export class DatabasePage extends View {
//   constructor() {
//     super()
//   }
//   render(props) {
//     super.render(props)
//   }

//   compileTemplate() {
//     super.compileTemplate`
//       <style>
//         body,
//         html {
//           margin: 0;
//           padding: 0;
//           font-family: Arial, Helvetica, sans-serif;
//           user-select: none;
//         }

//         .list {
//           display: flex;
//           flex-direction: column;
//           padding: 5px;
//           list-style-type: none;
//           margin: 0;
//         }

//         .list .row {
//           display: flex;
//           flex-direction: row;
//           padding: 5px 15px;
//           border-bottom: 1px solid rgba(0, 0, 0, 0.07);
//         }

//         .list .row>* {
//           flex-grow: 1;
//         }
//       </style>

//       <section id="db-section">
//         <h1>Databases</h1>
//         <div>${'title'} ${view`<span class="row">inline view</span>`}</div>
//         ${view`BEFORE IT`}

//         <ul class="list">
//         ${(props) => {
//         let nodes = []
//         for (let i = 0; i < 5; i++) {
//           const newV = view`<li class="row">Database ${'num'} here</li>`.render({ num: i })
//           nodes.push(newV)
//         }
//         return nodes
//       }}
//         </ul>
//       </section>
// `
//     this.render()
//   }
// }