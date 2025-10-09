let example1 = {
  "entry": "filename.js",
  "pages": {
    "filename.js": "FULL FILE OUTPUT"
  }
}


let example2 = {
  // List of children on the page
  "children": [
    {
      "type": "template",
      "id": "hero-a"
    },
    {
      "type": "template",
      "id": "flex-column",
      "children": [
        {
          "type": "template",
          "id": "card-a",
          "props": {
            "title": "Heading 1",
            "subtitle": "Subheading"
          }
        },
        {
          "type": "template",
          "id": "card-a",
          "props": {
            "title": "Heading 2",
            "subtitle": "Subheading"
          }
        },
        {
          "type": "template",
          "id": "card-a",
          "props": {
            "title": "Heading 3",
            "subtitle": "Subheading"
          }
        },
      ]
    },
    {
      "type": "custom",
      "rawHtml": "<div></div>"
    }
  ]
}





/**
 * 
 * @param {*} templateName 
 * @param {*} props 
 */
function createElementFromTemplate(templateName, props) {

}

