/**
 * 
 * @param {string | Node} tag 
 * @param {object} props 
 * @param  {...any} children 
 * @returns 
 */

import { View } from "./View";

export const createDomNode = (tag, props, ...children) => {
  // console.log('build1 --', tag, typeof tag, props, children)

  if (typeof tag === 'function') {
    props = props ?? {}
    props.children = children
    tag = tag(props)
  }

  if (tag instanceof View) {
    return tag.domEl
  }

  if (typeof tag === 'object') {
    return tag
  }

  if (!typeof tag === 'string') {
    return
  }

  // Create DOM Node
  const element = document.createElement(tag);

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
    _processChild(element, child, props)
  });

  return element;
};

/**
 * Processes the node child value
 * @param {Node} parent 
 * @param {any} child 
 */
const _processChild = (parent, child, props) => {

  // Text Node

  // Play View
  if (child instanceof View) {
    parent.appendChild(child.domEl);
  }
  // Text content
  else if (typeof child === 'string' || typeof child === 'number') {
    parent.appendChild(document.createTextNode(child));
  }
  // Normal Node
  else if (child instanceof Node) {
    parent.appendChild(child);
  }
  // Function to make nodes
  else if (typeof child === 'function') {
    const result = child(props)

    if (Array.isArray(result)) {
      parent.append(...result);
    }
    else if (result) {
      parent.appendChild(result);
    }
  }
}


export const Fragment = (props) => {
  const frag = new DocumentFragment()
  props?.children?.forEach((child) => {
    _processChild(frag, child)
  })
  return frag
};