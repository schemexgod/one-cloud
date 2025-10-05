
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
   * @returns {HTMLElement}
   */
  render() {

  }

  /**
   * 
   * @param {[string]} stringParts 
   */
  compileTemplate() {
    this.#_compileTemplate`  
    <template id="myTemplate">

    hello ${null} ${null} two
  <div class="card" data-tag="${null}">
  <script></script>
    <h3>12${null}4</h3>
    <p>${null}</p>
  </div>
  </template>
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
    const newNode = templateHolder.lastElementChild.content.cloneNode(true)
    console.log('[_compileTemplate] 0::', newNode)
    this._recursiveLoopNode2(newNode)
    document.body.appendChild(newNode)
  }

  /**
   * 
   * @param {Node} node 
   * @param {Int} index 
   */
  _recursiveLoopNode2(node, index = 0) {
    console.log('[_recursiveLoopNode2] 0::', node, index)

    // Check Attributes
    if (node instanceof Text) {
      const updateInfo = this._createBasicStringUpdateFunc(node.textContent, index)
      if (updateInfo) {
        const helpFunc = updateInfo.func
        index = updateInfo.index

        this.#_indexToUpdateFunc.push((params) => {
          const newStr = helpFunc(params)
          node.textContent = newStr
        })
      }
    }
    else if (node instanceof HTMLElement) {
      const length = node.attributes.length ?? 0
      for (let i = 0; i < length; i++) {
        const attrName = node.attributes[i].name
        const attributeVal = node?.getAttribute(attrName) ?? ''
        const updateInfo = this._createBasicStringUpdateFunc(attributeVal, index)

        if (updateInfo) {
          const helpFunc = updateInfo.func
          index = updateInfo.index

          this.#_indexToUpdateFunc.push((params) => {
            const newStr = helpFunc(params)
            node.setAttribute(attrName, newStr)
          })
        }
      }
    }
    for (const child of node.childNodes) {
      index = this._recursiveLoopNode2(child, index)
    }
    return index
  }
  /**
   * 
   * @param {string} textToCheck 
   * @param {Int} index 
   * @returns {{index: Int, func: (parms: [any]) => string}? }
   */
  _createBasicStringUpdateFunc(textToCheck, index) {
    const parts = textToCheck.split(this.#_stringSeparator)
    if (parts.length > 1) {
      let currentIndex = index

      console.log('[_recursiveLoopNode2] 1 ::', textToCheck)
      // add update func
      return {
        index: index + parts.length - 1,
        func: (parms) => {
          console.log('[_recursiveLoopNode2] 2 ::', parts.length, parts, currentIndex)
          let fullStr = ''
          for (let i = 0; i < parts.length - 1; i++) {
            console.log('[_recursiveLoopNode2] 3 ::', parts[i], parms[i + currentIndex])

            fullStr += parts[i] + (parms[i + currentIndex] ?? '')
          }
          fullStr += parts[parts.length - 1]
          return fullStr
        }
      }
    }
  }

  testIt(...params) {
    console.log('func count', this.#_indexToUpdateFunc.length)
    this.#_indexToUpdateFunc.forEach((func) => {
      func(params)
    })
    return this
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
