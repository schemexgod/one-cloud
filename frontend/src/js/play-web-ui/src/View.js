import { jsxTypeId, PlayIdentifiedType, playKeyType, JsxElementInfoType } from './play-types'

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
  return (new View()).compileTemplate(strings, ...values)
}
// export class View {
//   static compiler = new TemplateCompiler``

//   constructor() {
//     this.compileTemplate`<div></div>`
//   }
// }

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

  constructor() {
    this.compileTemplate`<div></div>`
  }

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
   * Compiles a template literal to use for rendering the view
   * @param {[string]} stringParts 
   * @returns {View}
   */
  compileTemplate(stringParts, ...valueParts) {
    console.log('stringParts', stringParts)
    stringParts = stringParts.slice(0)

    // Save the template values
    this.#_indexToTemplateValue = valueParts

    // Create new HTML string with placeholders for template values
    const newStr = stringParts.join(this.#_stringSeparator)

    // Load new HTML String into our temporary template holder
    _templateHolder.innerHTML = newStr

    // Create the node
    let newNode = _templateHolder.content.cloneNode(true)
    console.log('newstr', newStr, newNode)

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
    console.log('newstr2', newStr, newNode)

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
      // Parse the text for template placeholders
      const textToParse = node.textContent
      const textParts = textToParse.split(this.#_stringSeparator)

      // Check if text had any placeholders
      if (textParts.length > 1) {

        // New children to insert into the node
        const newChildren = []

        // Check each part if its a a property or function
        for (let i = 0; i < textParts.length - 1; i++) {
          // Create text node for current part
          const curTextString = textParts[i]
          const textNode = document.createTextNode(curTextString)

          // Add to new children
          newChildren.push(textNode)

          // Template placeholder value
          const valuePart = this.#_indexToTemplateValue[index]

          if (typeof valuePart === 'function') {

          }
          // Placeholder property name
          else if (typeof valuePart === 'string') {
            // Create a text node 
            const placeholderTextNode = document.createTextNode('')
            newChildren.push(placeholderTextNode)

            this.#_indexToUpdateFunc.push((props) => {
              const textValue = props?.[valuePart] ?? ''
              placeholderTextNode.textContent = textValue
              return placeholderTextNode
            })
          }
          // Update View
          else if (valuePart instanceof View) {
            if (Array.isArray(valuePart.domEl)) {
              newChildren.push(...valuePart.domEl)
            } else {
              newChildren.push(valuePart.domEl)
            }
            this.#_indexToUpdateFunc.push((props) => {
              valuePart.render(props)
              return valuePart
            })
          }

          // Increment index
          index += 1
        }
        node.replaceWith(...newChildren)
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

      if (funcVal instanceof View) {
        return {
          index: index + 1,
          func: (parms) => {
            funcVal.render(parms)
            return funcVal.domEl
          }
        }
      }
      else if (typeof funcVal === 'function') {

        // IF its a string lets create the dom elements
        // TODO: change logic so if its a string it is treated like string text content NOT compiled into html
        // if (typeof funcVal === 'string') {
        //   funcVal = `<template>${funcVal}</template>`
        //   _templateHolder.insertAdjacentHTML('beforeend', funcVal)

        //   // Create the node
        //   const newNode = _templateHolder.lastElementChild.content.cloneNode(true)
        //   return {
        //     index: index + 1,
        //     func: (parms) => {
        //       return newNode
        //     }
        //   }
        // }

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
              fullStr += parms?.[keyName] ?? ''
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



/**
 * NEW ATTEMPT AT VIEW
 */
/**
 * @type {PlayIdentifiedType}
 */
export class View2 {
  /** @type {string} Identifies this class as a play view */
  [playKeyType] = jsxTypeId

  /** 
   * The DOM element or elements associated with this View
   * @type {HTMLElement? | [HTMLElement]?}
   */
  domEl = document.createElement('div')

  /** @type {JsxElementInfoType?} */
  _jsxInfo

  
  /**
   * Put your Initial View logic here. It should return an HTML Element
   * @returns {JsxElementInfoType}
   */
  compile() {

  }
  /**
   * Renders/Updates the dom element
   * @returns {View2}
   */
  render(props) {
    this.willRender(props)
    if(this._jsxInfo) {
      this._jsxInfo.render(props)
    }
    else {
      this._jsxInfo = this.compile()
      this._jsxInfo?.render(props)
    }
    this.didRender(props)
  }

  willRender(props) { }
  didRender(props) { }


  /**
   * Appends this view to another view's DOM Element
   * @param {View2} parent 
   */
  appendTo(parent) {
    // Must be single element
    if (parent.domEl instanceof Element) {
      if (Array.isArray(this.domEl)) {
        parent.domEl.append(...this.domEl)
      } else {
        parent.domEl.append(this.domEl)
      }
    }
  }
}

class DBPage extends View2 {
  compile() {
    return (<div />)
  }
}