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
 * @typedef JsxElementInfo
 * @property {HTMLElement} domEl
 * @property {function(object)} [render]
 */
/** 
 * @typedef JsxBindPropInfo
 * @property {string} key
 */

// Factory Functions for Plain object types
const playKeyType = '__playtype'
const jsxTypeId = 'jsxInfo'
const jsxBindPropTypeId = 'jsxBindProp'

/** @type {(function(JsxElementInfo): JsxElementInfo & PlayIdentifiedType) & PlayTypeCheckable<JsxElementInfo>} */
export const JsxElementInfo = _createTypeBuilder(jsxTypeId)

/** @type {(function(JsxBindPropInfo): JsxBindPropInfo & PlayIdentifiedType) & PlayTypeCheckable<JsxBindPropInfo>} */
export const JsxBindProp = _createTypeBuilder(jsxBindPropTypeId)

/**
 * @template T
 * @param {*} typeId 
 * @returns {function(object): T}
 */
function _createTypeBuilder(typeId) {
  const rFunc = (props) => {
    return {
      [playKeyType]: typeId,
      ...props
    }
  }
  rFunc.is = (obj) => {
    return obj[playKeyType] == typeId
  }
  return rFunc
}