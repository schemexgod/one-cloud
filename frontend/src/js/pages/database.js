import { onAuthStateChanged } from "firebase/auth";

export const init = async () => {  
  const dbPage = await import('../../databases.html')?.[1]
  // dbPage[2]
  if(typeof dbPage !== 'string') {
    console.log('COULD NOT LOAD DB page')
    return
  }
  console.log(dbPage)
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