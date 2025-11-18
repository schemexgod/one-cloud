
import { JsxBindProp, JsxElementInfo, JsxElementInfoType } from "./play-types";
import { view, View } from "./View";

// disable console log
const console = { log: () => { } }

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

      // Return new info
      return JsxElementInfo({
        domEl: domEl,
        render: (props) => {
          domEl.textContent = props?.[propKey] ?? ''
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
      const result = child(props)
      if (result) {
        child = result
      }
    }
    if (Array.isArray(child)) {
      child.forEach((child) => {
        _processChild(returnInfo, child, props)
      })
    }
    else {
      _processChild(returnInfo, child, props)
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
  console.log('[[[[[[ parent render 1]]', parentRenderFunc)


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
    // Element type needs to be a Text Node
    const domEl = document.createTextNode('')
    const propKey = child.key ?? ''
    console.log('00000000000', domEl, props, child)
    const oldProps = { ...props }

    parent.render = (props) => {
      parentRenderFunc?.(props)
      domEl.textContent = oldProps?.[propKey] ?? props?.[propKey] ?? ''
      console.log('[[[[[[ parent render3]]', domEl, props, child, oldProps)
    }

    // Append render logic up
    parent.domEl.appendChild(domEl);
  }
  // Text content
  else if (typeof child === 'string' || typeof child === 'number') {
    console.log('-- creating child', child, parent.domEl)
    parent.domEl.appendChild(document.createTextNode(child));
  }

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