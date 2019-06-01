
/**
 * diff two lists in O(n)
 * @param {Array} oldList 
 * @param {Array} newList 
 * @param {String} key - object's property as key, default to 'key'
 * @return {Object} moves{Array} : a list of actions, including remove and insert;
 *                  newChildren{Array} : newList filtered by and aligned with oldList 
 */
function diff(oldList, newList, key='key'){
    var oldKeyIndexAndFreeItems = getKeyIndexAndFreeItems(oldList, key)
    var newKeyIndexAndFreeItems = getKeyIndexAndFreeItems(newList, key)
    var oldKeyIndex = oldKeyIndexAndFreeItems.keyIndex
    var newKeyIndex = newKeyIndexAndFreeItems.keyIndex
    var oldFreeItems = oldKeyIndexAndFreeItems.freeItems
    var newFreeItems = newKeyIndexAndFreeItems.freeItems

    // compute newChildren according to the order of oldList
    var newChildren = []
    var freeIndex = 0
    for(var i in oldList){
        var oldItemKey = getItemKey(oldList[i], key)

        if(oldItemKey){
            /* oldList[i] is an item with key
             * below find out the item with same key in newList 
             */
            if(!newKeyIndex.hasOwnProperty(oldItemKey)){
                newChildren.push(null)
            }
            else{
                var newItemIndex = newKeyIndex[oldItemKey] 
                newChildren.push(newList[newItemIndex])
            }
        }
        else{
            // use newList's free items to fill in some no-key-position in newChildren
            var freeItem = newFreeItems[freeIndex++]
            newChildren.push(freeItem || null)
        }
    }

    /* a copy of newChildren, used to simulate the moves
     * begin to compute and simulate the moves
     */
    var simulateList = newChildren.slice(0)
    var moves = []
    var i = 0

    // step 1: remove items from simulateList
    while(i < simulateList.length){
        if(simulateList[i] === null){
            moves.push(createMove(0, i))
            simulateList.splice(i, 1)
        }
        else{
            i++
        }
    }

    // step 2: insert items into simulateList
    // TODO
    var j = i = 0


    return {
        moves: moves,
        newChildren: newChildren
    }
}

/**
 * create a move
 * @param {Number} type - 0: remove, 1: insert 
 * @param {*} index - the start position 
 * @param {*} item - default to null, specify it if type is 1
 */
function createMove(type, index, item=null){
    return {
        type: type,
        index: index,
        item: item
    }
}

/**
 * To get key-index object and free(no key) items from list
 * @param {Array} list 
 * @param {String} key - object's property as key, default to 'key'
 * @returns {Object} keyIndex{Object} : key-index object;
 *                   freeItems{Array} : free(no key) items
 */
function getKeyIndexAndFreeItems(list, key){
    var keyIndex = {}
    var freeItems = []
    for(var i in list){
        var item = list[i]
        var itemKey = getItemKey(item, key)
        if(itemKey){
            keyIndex[itemKey] = i
        }
        else{
            freeItems.push(item)
        }
    }
    return {
        keyIndex: keyIndex,
        freeItems: freeItems
    }
}

/**
 * get the key of item 
 * @param {Object} item 
 * @param {String} key 
 */
function getItemKey(item, key){
    if(!item || !key) return void 0
    try {
        return item[key]
    }
    catch(error){
        console.error(error)
        return void 0
    }
}



var listDiff = new Object()
listDiff.diff = diff
module.exports = listDiff