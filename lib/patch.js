
const REPLACE = 0
const REORDER = 1
const PROPS = 2
const TEXT = 3

/**
 * create a single patch for a specific element
 * @param {Number} type - patch type:
 *                      - REPLACE, REORDER, PROPS, TEXT
 * @param {Object} content - content for updating:
 *                         - newElement, newMoves, newProps, newText 
 * @returns {Object} patch object containing 'type' and 'content'
 */
function createPatch(type, content){
    return {
        type: type,
        content: content
    }
}

patch.REPLACE = REPLACE
patch.REORDER = REORDER
patch.PROPS = PROPS
patch.TEXT = TEXT
patch.createPatch = createPatch
module.exports = patch