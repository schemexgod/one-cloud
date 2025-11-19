/** 
 * @typedef ViewType
 * @property {HTMLElement} domEl
*/
/**
 * @typedef PlayIdentifiedType
 * @property {string} __playtype
 */
/**
 * @template T
 * @typedef PlayTypeCheckable
 * @property {(obj: any) => obj is T} is
 */
/** 
 * @typedef JsxElementInfoType
 * @property {HTMLElement} domEl
 * @property {(passedProps: object, inlineProps: object) => void} [render]
 */
/** 
 * @typedef JsxBindPropInfoType
 * @property {string} key
 */

// Factory Functions for Plain object types
export const playKeyType = '__playtype'
export const jsxTypeId = 'jsxInfo'
export const jsxBindPropTypeId = 'jsxBindProp'

/** @type {(function(JsxElementInfoType): JsxElementInfoType & PlayIdentifiedType) & PlayTypeCheckable<JsxElementInfoType>} */
export const JsxElementInfo = _createTypeBuilder(jsxTypeId)

/** @type {(function(JsxBindPropInfoType): JsxBindPropInfoType & PlayIdentifiedType) & PlayTypeCheckable<JsxBindPropInfoType>} */
export const JsxBindProp = _createTypeBuilder(jsxBindPropTypeId, (props) => { return { key: props } })

/**
 * @template T
 * @param {*} typeId 
 * @returns {function(object): T}
 */
function _createTypeBuilder(typeId, customPropLogic) {
  const rFunc = (props) => {
    if (customPropLogic) {
      props = customPropLogic(props)
    }

    return {
      [playKeyType]: typeId,
      ...props
    }
  }
  rFunc.is = (obj) => {
    return obj[playKeyType] === typeId
  }
  return rFunc
}