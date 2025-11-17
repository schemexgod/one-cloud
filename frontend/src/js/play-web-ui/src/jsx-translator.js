
import { view, View } from "./View";

/**
 * 
 * @param {string | Node} tag 
 * @param {object} props 
 * @param  {...any} children 
 * @returns 
 */
export const createDomNode = (tag, props, ...children) => {
  console.log('build1 --', tag, typeof tag, props, children)
  console.log('build2 --', Array.from(arguments))

  if (typeof tag === 'function') {
    props = props ?? {}
    props.children = children
    tag = tag(props)
  }

  if (tag instanceof View) {
    // if (Array.isArray(tag.domEl)) {
    //   const frag = new DocumentFragment()
    //   frag.append(...tag.domEl)
    //   return frag
    // }
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

  // Function to make nodes
  if (typeof child === 'function') {
    console.log('--child', child, props)
    const result = child(props)

    if (Array.isArray(result)) {
      parent.append(...result);
      return
    }
    else if (result) {
      child = result
    }
  }

  // Play View
  if (child instanceof View) {

    if (Array.isArray(child.domEl)) {
      parent.append(...child.domEl)
    } else {
      parent.appendChild(child.domEl);
    }
  }
  // Text content
  else if (typeof child === 'string' || typeof child === 'number') {
    parent.appendChild(document.createTextNode(child));
  }
  // Normal Node
  else if (child instanceof Node) {
    parent.appendChild(child);
  }
}


export const Fragment = (props) => {
  const frag = new DocumentFragment()
  props?.children?.forEach((child) => {
    _processChild(frag, child)
  })
  return frag
};

export const prop = (name) => {
  return (props) => {
    return props[name] ?? 'cant find'
  }
}