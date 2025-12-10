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

/**
 * JSON string to parse. This comes from a streaming LLM Response
 * @param {string} jsonStr 
 * @returns {object?}
 */
const parseStreamingJsonAddingMissingTrails = (jsonStr) => {
    let currentOpenBracketCount = 0
    let currentCloseBracketCount = 0
    let isCurrentlyOpenString = false
    const jsonLength = jsonStr.length

    for (let i = 0; i < jsonLength; i++) {
        const curChar = jsonStr[i]

        // Check for quotes
        if (curChar == '"') {
            isCurrentlyOpenString = !isCurrentlyOpenString
        }
        // If not currently in an open quote
        else if (!isCurrentlyOpenString) {
            if (curChar == '{') {
                currentOpenBracketCount++
            } else if (curChar == '}') {
                currentCloseBracketCount++
            }
        }
    }

    // Close the quotes
    if (isCurrentlyOpenString) {
        jsonStr += '"'
    }

    // Add the extra brackeets
    const closedBracketsToAdd = currentOpenBracketCount - currentCloseBracketCount
    if (closedBracketsToAdd > 0) {
        // Add Closed brackets
        for (let i = 0; i < closedBracketsToAdd; i++) {
            jsonStr += '}'
        }
    } else {
        // Add open brackets
        const openBracketsToAdd = -closedBracketsToAdd
        for (let i = 0; i < openBracketsToAdd; i++) {
            jsonStr = '{' + jsonStr
        }
    }

    // Convert to object
    return JSON.parse(jsonStr)
}