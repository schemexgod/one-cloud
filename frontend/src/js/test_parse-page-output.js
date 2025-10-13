// ===============
//  DATA TYPES
// ===============

/**
 * @typedef {Object} PageJson
 * @property {PageJsonLayout} layout 
 */

/**
 * @typedef {Object} PageJsonLayout
 * @property {string} type 
 * @property {string} domProps 
 * @property {string} templateProps 
 * @property {[PageJsonLayout]} children 
 */


// ===============
//  FUNCTIONS
// ===============
/**
 * Takes the json object and builds the page from it
 * @param {PageJson} jsonObj 
 */
const parseJsonAndReloadDom = (jsonObj) => {
    // Check the type to see if its a template
    const type = jsonObj.type

    switch (type) {
        case value:
            
            break;
    
        default:
            break;
    }

    jsonObj.layout.children
}
