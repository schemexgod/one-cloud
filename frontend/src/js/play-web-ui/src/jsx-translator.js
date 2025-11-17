
import { JsxBindProp, JsxElementInfo } from "./play-types";
import { view, View } from "./View";

/**
 * The core JSX factor method. 
 * Creates a `JsxElementInfo` for each element. 
 * Creates DOM Elements and heirarchy.
 * Creates a render function that when called updates the DOM elements based on the based in props object
 * 
 * @param {any} tag 
 * @param {object} props 
 * @param  {...any} children 
 * @returns {JsxElementInfo}
 */
export const createDomNode = (tag, props, ...children) => {
  console.log('build1 --', tag, typeof tag, props, children)

  // Process function
  if (typeof tag === 'function') {
    props = props ?? {}
    props.children = children
    tag = tag(props)
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
  /** @type {JsxElementInfo} */
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
    _processChild(returnInfo, child, props)
  });

  return JsxElementInfo(returnInfo);
};

/**
 * Processes the node child value
 * @param {JsxElementInfo} parent 
 * @param {any} child 
 */
const _processChild = (parent, child, props) => {

  // Text Node
  let parentRenderFunc = parent.render

  // Function run to check 
  if (typeof child === 'function') {
    const result = child(props)

    if (Array.isArray(result)) {
      parent.domEl.append(...result);
      return
    }
    else if (result) {
      child = result
    }
  }

  // Already correct
  if (JsxElementInfo.is(child)) {
    if (Array.isArray(child.domEl)) {
      parent.domEl.append(...child.domEl)
    } else {
      parent.domEl.appendChild(child.domEl);
    }
    const childRender = child.render
    if (childRender) {
      parentRenderFunc = (props) => {
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

    // Return new info
    const childInfo = JsxElementInfo({
      domEl: domEl,
      render: (props) => {
        domEl.textContent = props ?? [propKey] ?? ''
        return domEl
      }
    })

    parentRenderFunc = (props) => {
      parentRenderFunc?.(props)
      domEl.textContent = props?.[propKey] ?? ''
    }

    // Append render logic up
    parent.domEl.appendChild(domEl);
  }
  // Text content
  else if (typeof child === 'string' || typeof child === 'number') {
    console.log('-- creating child', child, parent.domEl)
    parent.domEl.appendChild(document.createTextNode(child));
  }
  parent.render = parentRenderFunc
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

export const prop = (name) => {
  return (props) => {
    return props[name] ?? 'cant find'
  }
}
