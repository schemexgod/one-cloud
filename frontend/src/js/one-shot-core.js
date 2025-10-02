
window.testLoadTemplate = function () {
  Promise.all([
    loadTemplate('templates/card-a.html'),
  ]).then(templates => {
    templates.forEach(el => {
      // Do something with the templates
      const content = el.content.cloneNode(true)
      document.body.appendChild(content)
    })
  })
}

async function loadTemplate(filename) {
  const res = await fetch(filename)
  const text = await res.text()

  document.body.insertAdjacentHTML('beforeend', text)
  return document.body.lastElementChild
}

