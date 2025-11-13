/** 
 * Used for temporarily creating DOM elements from template strings
 * @type {HTMLTemplateElement} 
 */
const _templateHolder = document.createElement('template')

/**
 * Helper that builds a View from a template literal
 * @param {[string]} strings 
 * @param  {...(string | View)} values 
 * @returns {View}
 */
export function view(strings, ...values) {
  return (new View()).loadTemplate(strings, ...values)
}

/**
 * View Model that represents a DOM element
 */
export class View {
  /** 
   * The DOM element or elements associated with this View
   * @type {HTMLElement? | [HTMLElement]?}
   */
  domEl
  /** 
   * Used to find and replace values in the View template
   * @type {string} 
   */
  #_stringSeparator = '@@param@@'
  /** 
   * An array of functions that update the DOM Element associated with this View 
   * @type {[function]} 
   */
  #_indexToUpdateFunc = []
  /** 
   *  Based on the HTML Template, the index of the value to the passed in value
   * @type {Object<Int, function>}
   */
  #_indexToTemplateValue = {}

  #_didCompile = false

  /**
   * Updates the view with the given props
   * @param {object} props Object to use for updating the DOM ELement
   * @returns {View}
   */
  render(props) {
    this.#_indexToUpdateFunc.forEach((callback) => {
      callback(props)
    })
    return this
  }

  /**
   * Loads a template literal to use for rendering the view
   * @param {[string]} stringParts 
   * @returns {View}
   */
  loadTemplate(stringParts, ...valueParts) {
    stringParts = stringParts.slice(0)

    // Save the template values
    this.#_indexToTemplateValue = valueParts

    // Create new HTML string with placeholders for template values
    const newStr = stringParts.join(this.#_stringSeparator)

    // Load new HTML String into our temporary template holder
    _templateHolder.innerHTML = newStr

    // Create the node
    let newNode = _templateHolder.content.cloneNode(true)
    
    // Loop through DocumentFragment and create the update functions
    this.#_buildUpdateFuncs(newNode)

    // Set the DOM Element(s) to the model
    if (newNode.childNodes.length == 1) {
      newNode = newNode.childNodes[0]
    } else {
      let arr = []
      newNode.childNodes.forEach((node) => {
        arr.push(node)
      })
      newNode = arr
    }

    this.domEl = newNode

    return this
  }

  /**
   * Recursively builds the View functions needed to render/update the DOM 
   * @param {Node} node The Node to process
   * @param {Int} index the index of the Values from the View template
   */
  #_buildUpdateFuncs(node, index = 0) {

    // Editing HTML Element content
    if (node instanceof Text) {

      // Check if this is for function value
      const functionUpdateInfo = this.#_createFunctionStringUpdateFunc(node.textContent, index)
      if (functionUpdateInfo) {
        const helpFunc = functionUpdateInfo.func
        index = functionUpdateInfo.index

        this.#_indexToUpdateFunc.push((params) => {
          const newStr = helpFunc(params)
          node.replaceWith(newStr)
        })
      }
      // Normal Value
      else {
        const updateInfo = this.#_createBasicStringUpdateFunc(node.textContent, index)
        if (updateInfo) {
          const helpFunc = updateInfo.func
          index = updateInfo.index
          let cur = this.#_indexToUpdateFunc.length
          this.#_indexToUpdateFunc.push((params) => {
            const newStr = helpFunc(params)
            node.textContent = newStr
          })
        }
      }

    }
    // Editing HTML Element Attribute
    else if (node instanceof HTMLElement) {
      const length = node.attributes.length ?? 0
      for (let i = 0; i < length; i++) {
        const attrName = node.attributes[i].name
        const attributeVal = node?.getAttribute(attrName) ?? ''
        const updateInfo = this.#_createBasicStringUpdateFunc(attributeVal, index)

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

    // Continue recursive check 
    for (const child of node.childNodes) {
      index = this.#_buildUpdateFuncs(child, index)
    }

    return index
  }
  /**
 * 
 * @param {string} textToCheck 
 * @param {Int} index 
 * @returns {{index: Int, func: (parms: [any]) => string}? }
 */
  #_createFunctionStringUpdateFunc(textToCheck, index) {
    const parts = textToCheck.split(this.#_stringSeparator)
    if (parts.length > 1) {
      let currentIndex = index

      // Check if this was for a function value
      const funcVal = this.#_indexToTemplateValue[index]
      if (typeof funcVal === 'function') {
        let initialVal = funcVal()

        if (initialVal instanceof View) {
          return {
            index: index + 1,
            func: (parms) => {
              initialVal.loadTemplate(parms)
              return initialVal.domEl
            }
          }
        }

        // IF its a string lets create the dom elements
        // TODO: change logic so if its a string it is treated like string text content NOT compiled into html
        if (typeof initialVal === 'string') {
          initialVal = `<template>${initialVal}</template>`
          _templateHolder.insertAdjacentHTML('beforeend', initialVal)

          // Create the node
          const newNode = _templateHolder.lastElementChild.content.cloneNode(true)
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
   * @param {string} textToCheck The string to parse for placeholder 
   * @param {Int} index 
   * @returns {{index: Int, func: (parms: [any]) => string}? }
   */
  #_createBasicStringUpdateFunc(textToCheck, index) {
    const parts = textToCheck.split(this.#_stringSeparator)
    if (parts.length > 1) {
      return {
        index: index + parts.length - 1,
        func: (parms) => {
          let fullStr = ''
          for (let i = 0; i < parts.length - 1; i++) {
            const keyName = this.#_indexToTemplateValue[index + i]
            fullStr += parts[i]
            if (keyName) {
              fullStr += parms[keyName] ?? ''
            }
          }
          fullStr += parts[parts.length - 1]
          return fullStr
        }
      }
    }
  }
}


/**
 * NOT USING NOW
 * @param {string} str 
 */
function convertStringLiteralToTemplate(str) {
  let stringParts = []
  let values = []
  let currentPos = 0
  str.matchAll(/\$\{([^}]+)\}/g).forEach((curMatch) => {
    // curMatch.index
  })
}