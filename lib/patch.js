const REPLACE = 0
const REORDER = 1
const PROPS = 2
const TEXT = 3

/**
 * create a single patch for a specific element
 * @param {Number} type - patch type:
 *                      - REPLACE, REORDER, PROPS, TEXT
 * @param {Object} content - content for updating:
 *                         - newElement{Element}, newMoves{Array}, newProps{Object}, newText{String} 
 * @returns {Object} patch object containing 'type' and 'content'
 */
function createPatch(type, content) {
    return {
        type: type,
        content: content
    }
}

/**
 * apply patches to the real DOM tree
 * @param {Object} tree - the root of the DOM tree 
 * @param {Object} patches - containing index-patch arrays
 */
function patch(tree, patches) {
    var walker = { index: 0 }
    dfsWalk(tree, patches, walker)
}

function dfsWalk(node, patches, walker) {
    var currentPatch = patches[walker.index]

    var childCount = node.hasChildNodes() ? node.childNodes.length : 0
    for (let i = 0; i < childCount; i++) {
        var child = node.childNodes[i]
        walker.index++
        dfsWalk(child, patches, walker)
    }

    if (currentPatch) {
        applyPatch(node, currentPatch)
    }
}

function applyPatch(node, currentPatch) {
    for (var patch of currentPatch) {
        switch (patch.type) {
            case REPLACE:
                var newNode = createNewNode(patch.content)
                node.parentNode.replaceChild(newNode, node)
                break
            case REORDER:
                reorderChildren(patch.content)
                break
            case PROPS:
                setProps(patch.content)
                break
            case TEXT:
                try {
                    node.textContent = patch.content
                } catch (Error) {
                    throw new Error('Can not set textContent: ' + patch.content)
                }
                break
            default:
                throw new Error('Unknown patch type: ' + patch.type)
        }
    }

    function createNewNode(item) {
        if (Object.prototype.toString.call(item) === '[object String]') {
            // item type: String
            return document.createTextNode(item)
        }
        else {
            // item type: Element
            return item.render()
        }
    }

    function reorderChildren(moves) {
        for (var move of moves) {
            var index = move.index
            var item = move.item
            switch (move.type) {
                case 0:       // remove
                    node.removeChild(node.childNodes[index])
                    break
                case 1:       // insert
                    var newNode = createNewNode(item)
                    node.insertBefore(newNode, node.childNodes[index])
                    break
                case 2:       // replace
                    var newNode = createNewNode(item)
                    node.replaceChild(newNode, node.childNodes[index])
                    break
                default:
                    throw new Error('Unknown move type: ' + move.type)
            }
        }
    }

    function setProps(propsPatch) {
        for (var key in propsPatch) {
            var value = propsPatch[key]
            if (value === undefined) {
                node.removeAttribute(key)
            }
            else {
                setAttr(key, value)
            }
        }

        function setAttr(key, value) {
            switch (key) {
                case 'style':
                    node.style.cssText = value
                    break
                case 'value':
                    var tagName = node.tagName || ''
                    tagName = tagName.toLowerCase()
                    if (tagName === 'input' || tagName === 'textarea') {
                        node.value = value
                    }
                    else {
                        node.setAttribute(key, value)
                    }
                    break
                default:
                    node.setAttribute(key, value)
            }
        }
    }
}

Patch = new Object()
Patch.REPLACE = REPLACE
Patch.REORDER = REORDER
Patch.PROPS = PROPS
Patch.TEXT = TEXT
Patch.createPatch = createPatch
Patch.patch = patch
module.exports = Patch