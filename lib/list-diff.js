
/**
 * diff two lists in O(n)
 * @param {Array} oldList 
 * @param {Array} newList 
 * @param {String} key - object's property as key, default to 'key'
 * @return {Object} moves{Array} : a list of actions, including remove and insert;
 *                  newChildren{Array} : newList filtered by and aligned with oldList 
 */
function diff(oldList, newList, key='key'){
    //TODO

    return {
        moves: moves,
        newChildren: newChildren
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
    //TODO
}

/**
 * get the key of item 
 * @param {Object} item 
 * @param {String} key 
 */
function getItemKey(item, key){
    //TODO
}



var listDiff = new Object()
listDiff.diff = diff
module.exports = listDiff