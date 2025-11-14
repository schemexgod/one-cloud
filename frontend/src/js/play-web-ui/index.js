export { view, View } from './src/View'

/**
 * 
 * @param {string | Node} tag 
 * @param {*} props 
 * @param  {...any} children 
 * @returns 
 */
export const jsxToDomNode = (tag, props, ...children) => {
  console.log('build1 --', tag, props, children)

  if (typeof tag === 'function') {
    props.children = children
    tag = tag(props)
  }

  if (typeof tag === 'object') {
    return tag
  }
  
  if (!typeof tag === 'string') {
    return
  }
  const element = document.createElement(tag);


  Object.entries(props || {}).forEach(([key, value]) => {
    // Block some internal props
    if (key.startsWith('__')) { return }

    if (key === 'className') { // Handle className for HTML classes
      element.setAttribute('class', value);
    } else if (key.startsWith('on') && typeof value === 'function') { // Handle event listeners
      const eventName = key.toLowerCase().substring(2);
      element.addEventListener(eventName, value);
    } else {
      element.setAttribute(key, value);
      console.log('--  attr', key, value)
    }
  });

  children.flat().forEach(child => {
    console.log('--  children', child, typeof child)
    if (typeof child === 'string' || typeof child === 'number') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  });

  return element;
};
