
function MockComp() {
  const tvar = useStateTest()
  console.log('mock', this)
}

function useStateTest() {
  console.log('this', this)
  return 'hi'
}

window.MockComp = MockComp


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
let myTemp
window.testLoadTemplate2 = (str, ...props) => {
  if (myTemp) {
    return myTemp
  }
  myTemp = (new TestHtmlTemplate()).compileTemplate()
  return myTemp
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
  /** @type {HTMLElement} */
  domEl

  /** @type {string} */
  #_stringSeparator = '@@param@@'

  /** @type {[function]} */
  #_indexToUpdateFunc = []

  /** @type {Object<Int, function>} */
  #_indexToUpdateFunc2 = {}

  #_didCompile = false

  /**
   * @returns {HTMLElement}
   */
  render() {

  }

  /**
   * 
   * @param {object} props 
   */
  compileTemplate(props) {
    if (this.#_didCompile) {
      this.#_indexToUpdateFunc.forEach((callback) => {
        callback(props)
      })
      return this
    }
    this.#_compileTemplate`  
    hello ${null} ${null} two
  <div class="card" data-tag="${null}">
    <h3>12${null}4</h3>
    <p>${null}</p>
    <div id="links">
    ${() => {
        let html = ''
        for (let i = 0; i < 5; i++) {
          html += `<a href="#">link ${i}</a>`
        }
        return html
      }}
    </div>
  </div>
    `
    this.#_didCompile = true
    return this
  }

  /**
   * 
   * @param {[string]} stringParts 
   */
  #_compileTemplate(stringParts2, ...valueParts) {
    let stringParts = stringParts2.slice(0)
    // wrap in template tags
    if (stringParts.length > 0) {
      console.log('ddd', stringParts)
      stringParts[0] += '<template>'
      stringParts[stringParts.length - 1] += '</template>'
    }
    console.log('dddvalueParts', valueParts)

    // check for any functions in the values. These will be handled special and kept track
    for (let i = 0; i < valueParts.length; i++) {
      const curpPart = valueParts[i]
      if (typeof curpPart === 'function') {
        this.#_indexToUpdateFunc2[i] = curpPart
      }
    }

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
   * @param {[string]} stringParts 
   */
  #_compileTemplate_old(stringParts) {

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
      // Check if this is for function value
      const functionUpdateInfo = this._createFunctionStringUpdateFunc(node.textContent, index)
      if (functionUpdateInfo) {
        const helpFunc = functionUpdateInfo.func
        index = functionUpdateInfo.index

        this.#_indexToUpdateFunc.push((params) => {
          const newStr = helpFunc(params)
          console.log('(((**** testing nodes', newStr)
          node.replaceWith(newStr)
        })
      } else {
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
  _createFunctionStringUpdateFunc(textToCheck, index) {
    const parts = textToCheck.split(this.#_stringSeparator)
    if (parts.length > 1) {
      let currentIndex = index
      console.log('[_recursiveLoopNode2] 1 ::', textToCheck)

      // Check if this was for a function value
      const funcVal = this.#_indexToUpdateFunc2[index]
      if (funcVal) {
        console.log('***** index is function', index)
        let initialVal = funcVal()

        // IF its a string lets create the dom elements
        if (typeof initialVal === 'string') {
          initialVal = `<template>${initialVal}</template>`
          templateHolder.insertAdjacentHTML('beforeend', initialVal)

          // Create the node
          const newNode = templateHolder.lastElementChild.content.cloneNode(true)
          return {
            index: index + 1,
            func: (parms) => {
              return newNode
            }
          }
        }

        return {
          index: index + 1,
          func: (parms) => {
            return funcVal()
          }
        }
      }
    }
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

}
window.TestHtmlTemplate = TestHtmlTemplate