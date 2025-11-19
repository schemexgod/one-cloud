
import { JsxBindProp, JsxElementInfo, JsxElementInfoType } from "./play-types";
import { view, View } from "./View";

// disable console log
// const console = { log: () => { } }

/**
 * The core JSX factor method. 
 * Creates a `JsxElementInfo` for each element. 
 * Creates DOM Elements and heirarchy.
 * Creates a render function that when called updates the DOM elements based on the based in props object
 * 
 * @param {any} tag 
 * @param {object} props 
 * @param  {...any} children 
 * @returns {JsxElementInfoType}
 */
export const createDomNode = (tag, props, ...children) => {
  console.log('build1 --', tag, typeof tag, props, children)
  let propsToPassToChild
  let isView = false

  // Process function
  if (typeof tag === 'function') {
    props = props ?? {}
    props.children = children
    if (tag.prototype instanceof View) {
      console.log('View2 !!! ********', props, tag)
      isView = true
      tag = new tag(props)
    } else {
      console.log('tag ********', tag)
      tag = tag(props)
      console.log('tag2 ********', tag, props)
    }

    // Pass these props to its children
    propsToPassToChild = props
  }

  // Figure out the element type
  if (typeof tag == 'object') {
    // Already correct
    if (JsxElementInfo.is(tag)) {
      // TODO: Check if we need to pass this down to the properties section
      return tag
    }
    // Create update function for binding
    if (JsxBindProp.is(tag)) {
      // Element type needs to be a Text Node
      const domEl = document.createTextNode('')
      const propKey = tag.key ?? ''
      const propKeyPath = propKey.split('.')
      const needsPath = propKeyPath.length > 1

      // Return new info
      return JsxElementInfo({
        domEl: domEl,
        render: (props) => {
          console.log('^^^^ bind function', props)
          domEl.textContent = (needsPath ? getValueByArrayPath(props, propKeyPath) : props?.[propKey]) ?? ''

          console.log('{{{{{ inside child render 1::', domEl, props, propKey)
          return domEl
        }
      })
    }

    // Unknown type of object
    console.warn('ERROR unsporrted type', tag)
  }

  // Continue with default logic
  if (!(typeof tag === 'string')) { return }

  // Create DOM Node
  const element = document.createElement(tag);

  // Return Info
  /** @type {JsxElementInfoType} */
  const returnInfo = { domEl: element }

  // Loop through and process props
  Object.entries(props || {}).forEach(([key, value]) => {

    // Block some internal props
    if (key.startsWith('__')) { return }

    // CSS Classes
    if (key === 'className') { // Handle className for HTML classes
      element.setAttribute('class', value);
    }
    // Event Listeners
    else if (key.startsWith('on') && typeof value === 'function') { // Handle event listeners
      const eventName = key.toLowerCase().substring(2);
      console.log('adding event', eventName)
      element.addEventListener(eventName, value);
    }
    // Attributes
    else {
      element.setAttribute(key, value);
      console.log('--  attr', key, value)
    }
  });

  // Process children and add to DOM Node
  children.flat().forEach(child => {
    // Function run to check 
    if (typeof child === 'function') {
      const result = child(propsToPassToChild)
      if (result) {
        child = result
      }
    }
    if (Array.isArray(child)) {
      child.forEach((child) => {
        _processChild(returnInfo, child, propsToPassToChild)
      })
    }
    else {
      _processChild(returnInfo, child, propsToPassToChild)
    }
  });

  return JsxElementInfo(returnInfo);
};

/**
 * Processes the node child value
 * @param {JsxElementInfoType} parent 
 * @param {any} child 
 */
const _processChild = (parent, child, props) => {

  // Text Node
  const parentRenderFunc = parent.render
  console.log('[[[[[[ parent render 1]]', props, parentRenderFunc)


  // Already correct
  if (JsxElementInfo.is(child)) {
    if (Array.isArray(child.domEl)) {
      parent.domEl.append(...child.domEl)
    } else {
      parent.domEl.appendChild(child.domEl);
    }
    const childRender = child.render
    if (childRender) {
      console.log('[[[[[[ parent render 1.5]]', child, parentRenderFunc)

      parent.render = (props) => {
        console.log('[[[[[[ parent render 2]]', props, childRender)
        parentRenderFunc?.(props)
        childRender(props)
      }
    }

  }
  // Create update function for binding
  else if (JsxBindProp.is(child)) {
    const propKey = child.key ?? ''
    const overrideProps = { ...props }

    const propKeyPath = propKey.split('.')
    const needsPath = propKeyPath.length > 1

    if (propKey == 'children') {
      console.log('BINDING CHILDREN!', propKey)
      // Create a placeholder element for insert
      let domEls = [document.createElement('template')]

      parent.render = (props, inlineProps) => {
        parentRenderFunc?.({ ...props, ...inlineProps })
        console.log('^^^^ bind function222', props, overrideProps)
        // check for children
        const children = props?.children
        console.log('**** render my children', children, overrideProps, props)
        console.log('**** render my children inlineProps', inlineProps)
        if (children) {

          if (children.length === 0) {
            let newDomEl = document.createElement('template')
            let lastItem = domEls[domEls.length - 1]
            parent.domEl.insertBefore(newDomEl, lastItem.nextSibling)
            domEls.forEach((cur) => {
              cur.remove()
            })
            domEls = [newDomEl]
          } else {
            let nodes = []
            children.forEach((cur) => {
              nodes.push(cur.domEl)
              cur.render?.(props)
            })

            let lastItem = domEls[domEls.length - 1]
            nodes.forEach((curChild) => {
              /** @type {HTMLElement} */
              parent.domEl.insertBefore(curChild, lastItem.nextSibling)
              lastItem = curChild
            })
            domEls.forEach((cur) => {
              cur.remove()
            })
            domEls = nodes
          }
        }
        console.log('&&&& the most special children render', props)
      }
      parent.domEl.appendChild(...domEls);
    }
    else {
      // Element type needs to be a Text Node
      const domEl = document.createTextNode('')
      console.log('00000000000', domEl, props, child, overrideProps)
      parent.render = (props) => {
        parentRenderFunc?.(props)
        let content

        // Try override props first
        if (overrideProps) {
          content = needsPath ? getValueByArrayPath(overrideProps, propKeyPath) : overrideProps?.[propKey]
        }
        // Try new props
        if (!content) {
          content = needsPath ? getValueByArrayPath(props, propKeyPath) : props?.[propKey]
        }

        domEl.textContent = content ?? ''
        console.log('[[[[[[ parent render3]]', domEl, props, child, overrideProps)
      }
      // Append render logic up
      parent.domEl.appendChild(domEl);
    }


  }
  // Text content
  else if (typeof child === 'string' || typeof child === 'number') {
    console.log('-- creating child', child, parent.domEl)
    parent.domEl.appendChild(document.createTextNode(child));
  }

}

/**
 * Gets the Objects data from the given array of nested keys
 * @param {object} obj Object to access data from
 * @param {[string]} pathArr array of keys to access nested data in the given object
 * @returns 
 */
const getValueByArrayPath = (obj, pathArr) => {
  if (!obj) { return }
  console.log('start reduce +++', pathArr, obj)
  const len = pathArr.length

  let currentVal = obj
  for (let i = 0; i < len; i++) {
    const curKey = pathArr[i]
    const curVal = currentVal[curKey]
    console.log('inside reduce +++', curKey)
    if (currentVal[curKey]) {
      currentVal = curVal
    } else {
      return
    }
  }
  return currentVal
}

export const Fragment = (props) => {
  const frag = new DocumentFragment()
  const returnInfo = JsxElementInfo({ domEl: frag })
  props?.children?.forEach((child) => {
    _processChild(returnInfo, child)
  })
  console.log('final child', returnInfo.children)
  return returnInfo
};

export const prop = JsxBindProp