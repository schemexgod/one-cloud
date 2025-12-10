/**
 * Testing ideas for html templates
 */


function createFromTemplate() {

}

/**
 * Static helper functions
 */
const Helper = {
    /**
     * Creates an HTMLElement from a premade template
     * @param {string} templateId  
     * @param {object} props 
     * @returns {HTMLElement}
     */
    // function createElementFromTemplate(templateId, props) 
}


/**
 * A simple Card layout
 * @param {string?} title 
 * @param {string?} subtitle 
 * @param {string?} imageUrl 
 * @returns {HTMLElement}
 */
export const CardA = (title, subtitle, imageUrl) => {

}

/**
 * Hero section layout with a large image background and text
 * @param {string?} title 
 * @param {string?} subtitle 
 * @param {string?} backgroundImage 
 * @returns {HTMLElement}
 */
export const HeroA = (title, subtitle, backgroundImage) => {

}


let testJson = {
    "layout": [
        {

        }
    ]
}

/**
 * LLM Output: JSON representing 3 phases of page creation
 */

const json = {
    "layout": {
        // Name of Layout Template or html tag
        "type": "Main",
        // Object of DOM Properties to set on the element
        "domProps": {
            "id": "some-dom-id"
        },
        "templateProps": {
            "title": "content-id"
        },
        // Child elements of this element
        "children": [

        ]
    },
    "content": {
        "some-content-id": "The content to insert"
    }
}



// Template Custom Props

/**
 * @typedef {object} CardA
 * @property {string?} title 
 * @property {string?} subtitle 
 * @property {string?} imageUrl 
 */

/**
 * @typedef {object} HeroA
 * @property {string?} title 
 * @property {string?} subtitle 
 * @property {string?} backgroundImage 
 */


// SCHEMA:
const schema = {
    "title": "Page",
    "description": "Full Web Page",
    "properties": {
        "layout": {
            "description": "Describes the entire layout for the page or component",
            "$ref": "#/$defs/Element"
        },
        "content": {
            "description": "An entire dataset of IDs to content that should be displayed in the layout",
            "type": "object",
            "patternProperties": {
                "^[a-zA-Z][a-zA-Z0-9_]*$": {
                    "type": "string",
                    "description": "Text or URL to display in HTML layout"
                }
            },

        }
    },
    "$defs": {
        "Element": {
            "description": "DOM Element",
            "type": "object",
            "properties": {
                "type": {
                    "type": "string",
                    "enum": ["CardA", "HeroA", "div"],
                    "description": "Name of the Element template or HTML tag name"
                },
                "domProps": {
                    "type": "object",
                    "description": "DOM properties and values for the element. Does NOT include javascript interactions."
                },
                "templateProps": {
                    "type": "object",
                    "description": "Custom template properties to pass to the element"
                },
                "children": {
                    "type": "array",
                    "items": {
                        "oneOf": [
                            {
                                "$ref": "#/$defs/Element"
                            },
                            {
                                "type": "string",
                                "description": "Text node"
                            }
                        ]
                    }
                }
            }
        }
    }
}