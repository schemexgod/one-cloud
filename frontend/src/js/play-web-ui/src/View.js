import { jsxTypeId, PlayIdentifiedType, playKeyType, JsxElementInfoType } from './play-types'


/**
 * NEW ATTEMPT AT VIEW
 */
/**
 * @type {PlayIdentifiedType}
 */
export class View {
  /** @type {string} Identifies this class as a play view */
  [playKeyType] = jsxTypeId

  /** 
   * The DOM element or elements associated with this View
   * @type {HTMLElement? | [HTMLElement]?}
   */
  get domEl() { return this._jsxInfo?.domEl }

  /** @type {JsxElementInfoType?} */
  get _jsxInfo() {
    if (this.__jsxInfo) {
      return this.__jsxInfo
    }
    this.__jsxInfo = this.compile()
    return this.__jsxInfo
  }
  /** @type {JsxElementInfoType?} */
  __jsxInfo

  /** @type {object?} */
  _overrideProps

  constructor(initProps) {
    this._overrideProps = initProps
  }

  /**
   * Put your Initial View logic here. It should return an HTML Element
   * @returns {JsxElementInfoType}
   */
  compile() { }

  /**
   * Renders/Updates the dom element
   * @returns {View}
   */
  render(props) {
    props = { ...props, ...this._overrideProps }
    this.willRender(props)
    this._jsxInfo.render?.(props)
    this.didRender(props)
    return this
  }

  willRender(props) { }
  didRender(props) { }


  /**
   * Appends this view to another view's DOM Element
   * @param {View} parent 
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
  /**
   * 
   * @param {HTMLElement} domEl 
   * @param {boolean} doReplace 
   */
  mountTo(domEl, doReplace = true) {
    this.render()

    if (doReplace) {
      domEl.replaceChildren(this.domEl)
    } else {
      domEl.append(this.domEl)
    }
  }
}
