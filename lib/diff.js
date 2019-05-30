var patch = require('./patch')

/**
 * use dfs to diff between the old and new Virtual-DOM tree
 * @param {Element} oldTree 
 * @param {Element} newTree 
 * @returns {Object} an array of patches
 */
function diff(oldTree, newTree) {
    /* index: the count number when preorder traversal
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
        diffChildren(oldElement, newElement, index, patches, currentPatch)
    }else{
        // check patch type: REPLACE
        currentPatch.push(patch.createPatch(type=patch.REPLACE, content=newElement))
    }

    if(currentPatch.length){
        patches[index] = currentPatch
    }
}

function diffChildren(oldElement, newElement, index, patches, currentPatch){
    // TODO
}

function diffProps(oldElement, newElement){
    // TODO
}

function isString(obj){
    return Object.prototype.toString.call(obj) === '[object String]'
}

function isSameElement(oldElement, newElement){
    return oldElement.tagName === newElement.tagName && oldElement.key === newElement.key
}

module.exports = diff