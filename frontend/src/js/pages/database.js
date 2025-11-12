import { onAuthStateChanged } from "firebase/auth";

/**
 * Creates DB Page
 * @param {AppContext} context 
 */
export const init = async (context) => {
  const template = await import('../../databases.html')
  const pageHTML = template?.[1]
  if (typeof pageHTML !== 'string') {
    console.log('COULD NOT LOAD DB page', pageHTML)
    return
  }

  // Start injecting html page
  const frag = document.createDocumentFragment()
  const holder = document.createElement('html')
  holder.innerHTML = pageHTML
  const innerChildren = Array.from(holder.querySelector('body')?.children ?? [])

  // Add to fragment
  for (let child of innerChildren) {
    frag.appendChild(child)
  }

  // Clear db list
  frag.querySelector('.list').replaceChildren()

  // Insert page
  document.body.replaceChildren(frag)

  // Load DB List
  const listEl = document.body.querySelector('.list')
  try {
    const list = await getDatabases(context.authToken)
    list.forEach((info) => {
      const nDate = (new Date(info.date_created)).toLocaleString()
      listEl.innerHTML += `<li class="row"><div>${info.name}</div><div>${nDate}</div></li>`
    })
  }
  catch (error) {
    listEl.textContent = `Error getting databases: '${error.message ?? 'Unknown'}'`
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
      if(resp.status == 401) {
        // window.location.reload()
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

// onAuthStateChanged(auth, async (user) => {
//   if (!user) { return }

// console.log('user', user)
//   const jwtId = await user?.getIdToken()
//   // const testEndPoint = 'https://us-central1-oneshot-c5e23.cloudfunctions.net/dbConnect'
//   const testEndPoint = 'http://127.0.0.1:5001/oneshot-c5e23/us-central1/dbConnect'
//   const postData = {
//     title: 'My New Post',
//     body: 'This is the content of my new post.',
//     userId: "some-uid",
//     endpoint: "create-db",
//     displayName: "my DB"
//   };

//   fetch(testEndPoint, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${jwtId}`
//     },
//     body: JSON.stringify(postData)
//   })
//     .then(response => {
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       return response.json();
//     })
//     .then(data => {
//       console.log('New post created:', data);
//     })
//     .catch(error => {
//       console.error('Error creating post:', error);
//     });
// })