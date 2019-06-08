var patch = require('./patch')
var listDiff = require('./list-diff')
var listDiff2 = require('list-diff2')
var VirtualElement = require('./element')

/**
 * use dfs to diff between the old and new Virtual-DOM tree
 * @param {Element} oldTree 
 * @param {Element} newTree 
 * @returns {Object} an array of patches
 */
function diff(oldTree, newTree) {
    /* index: the order number in pre-order traversal
     * patches: key=index, value=currentPatch(Array)
     */
    var index = 0
    var patches = {}
    if (newTree) {
        dfsElement(oldTree, newTree, index, patches)
    }
    return patches
}

function dfsElement(oldElement, newElement, index, patches) {
    var currentPatch = []

    if (!newElement) {
        /* newElement is removed
         * automatically handled when reordering childern of its parent element  
         */
    } else if (isString(oldElement) && isString(newElement)){
        // check patch type: TEXT
        if(oldElement !== newElement){
            currentPatch.push(patch.createPatch(type=patch.TEXT, content=newElement))
        }
    }else if(isSameElement(oldElement, newElement)){
        // check patch type: PROPS
        var propsPatch = diffProps(oldElement, newElement)
        if(propsPatch){
            currentPatch.push(patch.createPatch(type=patch.PROPS, content=propsPatch))
        }

        // check patch type: REORDER
        diffChildren(oldElement.children, newElement.children, index, patches, currentPatch)
    }else{
        // check patch type: REPLACE
        currentPatch.push(patch.createPatch(type=patch.REPLACE, content=newElement))
    }

    if(currentPatch.length){
        patches[index] = currentPatch
    }
}

function diffChildren(oldChildren, newChildren, index, patches, currentPatch){
    var difference = listDiff.diff(oldChildren, newChildren, 'key')
    newChildren = difference.newChildren

    // check patch type: REORDER
    if(difference.moves.length){
        var reorderPatch = patch.createPatch(type=patch.REORDER, content=difference.moves) 
        currentPatch.push(reorderPatch)
    }

    var leftChild = null        // leftChild is Element or String
    var currentIndex = index    // represent the index of current Element
    for(var i in oldChildren){
        var oldChild = oldChildren[i]
        var newChild = newChildren[i]
        currentIndex = leftChild instanceof VirtualElement ?
                       currentIndex + leftChild.count + 1 :     // Element
                       currentIndex + 1                         // null or String
        dfsElement(oldChild, newChild, currentIndex, patches)
        leftChild = oldChild
    }
}

function diffProps(oldElement, newElement){
    var count = 0
    var oldProps = oldElement.props
    var newProps = newElement.props
    var propsPatch = {}
    
    /* check props type: updated or deleted
     * newProps[key]: newValue{String} or {undefined}
     */
    for(var key in oldProps){
        var value = oldProps[key]
        if(newProps[key] !== value){
            count++
            propsPatch[key] = newProps[key]
        }
    }

    /* check props type: added
     * newProps[key]: newValue{String}
     */
    for(var key in newProps){
        var value = newProps[key]
        if(!oldProps.hasOwnProperty(key)){
            count++
            propsPatch[key] = value
        }
    }

    return count === 0 ? null : propsPatch
}

function isString(obj){
    return Object.prototype.toString.call(obj) === '[object String]'
}

function isSameElement(oldElement, newElement){
    return (oldElement instanceof VirtualElement) && (newElement instanceof VirtualElement) &&
        (oldElement.tagName === newElement.tagName) && (oldElement.key === newElement.key)
}

module.exports = diff