
window.testLoadTemplate = () => {
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

window.testLoadTemplate2 = (str, ...props) => {
  return (new TestHtmlTemplate()).compileTemplate()
}

const templateHolder = document.createElement('div')

async function loadTemplate(filename) {
  const res = await fetch(filename)
  const text = await res.text()
  // Create t
  templateHolder.insertAdjacentHTML('beforeend', text)
  return templateHolder.lastElementChild
}

function testTemplate(tempStr) {

  templateHolder.insertAdjacentHTML('beforeend', tempStr)
  return templateHolder.lastElementChild
}


class TestHtmlTemplate {
  /** @type {string} */
  #_stringSeparator = '@@param@@'

  /** @type {[function]} */
  #_indexToUpdateFunc = []

  /**
   * 
   * @param {[string]} stringParts 
   */
  compileTemplate() {
    this.#_compileTemplate`  
    hello ${null} ${null} two
  <div class="card" data-tag="${null}">
  <script></script>
    <h3>12${null}4</h3>
    <p>${null}</p>
  </div>
    `
    return this
  }

  /**
   * 
   * @param {[string]} stringParts 
   */
  #_compileTemplate(stringParts) {
    const newStr = stringParts.join(this.#_stringSeparator)
    console.log(newStr)

    templateHolder.insertAdjacentHTML('beforeend', newStr)

    // Create the node
    const newNode = templateHolder.lastElementChild.cloneNode(true)
    this._recursiveLoopNode2(newNode)
    document.body.appendChild(newNode)
  }

  /**
   * 
   * @param {Node} node 
   * @param {Int} index 
   */
  _recursiveLoopNode2(node, index = 0) {
    // Check Attributes
    if (node instanceof Text) {
      // Look for seperator
      const parts = node.textContent.split(this.#_stringSeparator)
      if (parts.length > 1) {
        let currentIndex = index

          console.log('dddddddd')
        // add update func
        this.#_indexToUpdateFunc.push((parms) => {
          console.log('PAPPAPPAPA', parts.length, parts)
          let fullStr = ''
          for (let i = 0; i < parts.length - 1; i++) {
                      console.log('PAPPAPPAPA2', parts[i], parms[i + currentIndex])

            fullStr += parts[i] + parms[i + currentIndex]
          }
          fullStr += parts[parts.length - 1]
          node.textContent = fullStr
        })
        index += parts.length - 1
      }
    }
    for(const child of node.childNodes) {
      this._recursiveLoopNode2(child, index)
    }
  }

  testIt(...params) {
    this.#_indexToUpdateFunc.forEach((func) => {
      func(params)
    })
  }

  #_compileTemplate2(stringParts) {

    /** @type {string} */
    let fullString = ''
    /** @type {[number]} */
    let stringPositions = []

    const length = stringParts.length

    for (let i = 0; i < length; i++) {
      let stringPart = stringParts[i]
      // trim the beginning
      if (i == 0) {
        stringPart = stringPart.trimStart()
      }
      console.log(stringPart);
      fullString += stringPart
      stringPositions.push(fullString.length)
    }

    templateHolder.insertAdjacentHTML('beforeend', fullString)

    // Create the node
    const newNode = templateHolder.lastElementChild.cloneNode(true)

    console.log('final str ::', fullString)
    console.log('final str ::', newNode)
    console.log('stringPositions str ::', stringPositions)
    _recursiveLoopNode(newNode, stringPositions[1])
  }
}

/**
 * 
 * @param {Node} domEl 
 * @param {number} positionToFind 
 * @param {number} curPosition 
 */
function _recursiveLoopNode(domEl, positionToFind, curPosition = 0) {
  console.log('itter', domEl, curPosition)

  /** @type {number} */
  let endOfTagIndex

  // Check text nodes differently
  if (domEl instanceof Text) {
    domEl

  }
  // Normal nodes
  else if (domEl.outerHTML) {
    // only check to end of `>`
    const textHtml = domEl.outerHTML
    endOfTagIndex = textHtml.indexOf('>') + 1
    curPosition += endOfTagIndex
    console.log('its an html!', textHtml.substring(0, endOfTagIndex))
  }


  for (const child of domEl.childNodes) {
    if (_recursiveLoopNode(child, positionToFind, curPosition)) {
      return
    }
  }
}