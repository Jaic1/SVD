(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
window.svd = {
    el: require('./lib/element'),
    diff: require('./lib/diff'),
    patch: require('./lib/patch')
}
},{"./lib/diff":2,"./lib/element":3,"./lib/patch":4}],2:[function(require,module,exports){
var patch = require('./patch')
var listDiff = require('list-diff2')
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
    var difference = listDiff(oldChildren, newChildren, 'key')
    newChildren = difference.children

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
},{"./element":3,"./patch":4,"list-diff2":5}],3:[function(require,module,exports){

/**
 * Create an instance of Virtual-dom Element
 * @param {String} tagName - tagName in DOM's API
 * @param {Object} props - this element's key-value properties
 * @param {Array<Element|String>} children - this element's child elements
 *                                         - could be element instance or string as textNode
 */

function Element(tagName, props, children){
    if(!(this instanceof Element)){
        return new Element(tagName, props, children)
    }

    if(Object.prototype.toString.call(props) === '[object Array]'){
        children = props
        props = {}
    }

    this.tagName = tagName
    this.props = props || {}
    this.children = children || []
    this.key = props ? props.key : void 0

    // count the number of child elements
    var count = 0
    for(var i in children){
        var child = children[i]
        if(child instanceof Element){
            count += child.count
        }
        else{
            // convert to string manually so it can be created as textNode
            children[i] = '' + child
        }
        count++
    }
    this.count = count
}

/**
 * use dfs algorithm to render the whole Virtual-DOM tree
 * into real DOM tree
 */

Element.prototype.render = function() {
    var el = document.createElement(this.tagName)
    var props = this.props

    for(var propKey in props){
        var propValue = props[propKey]
        setAttr(el, propKey, propValue)
    }

    for(var i in this.children){
        var child = this.children[i]
        var childEl = (child instanceof Element)?
                        child.render():
                        document.createTextNode(child)
        el.appendChild(childEl)
    }

    return el
}

/**
 * set the attribute of DOM element
 * used in Element.prototype.render
 */
function setAttr(el, key, value){
    switch(key){
        case 'style':
            el.style.cssText = value
            break
        case 'value':
            var tagName = el.tagName || ''
            tagName = tagName.toLowerCase()
            if(tagName === 'input' || tagName === 'textarea'){
                el.value = value
            }
            else{
                el.setAttribute(key, value)
            }
            break
        default:
            el.setAttribute(key, value)
            break
    }
}

module.exports = Element
},{}],4:[function(require,module,exports){

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
function createPatch(type, content){
    return {
        type: type,
        content: content
    }
}

patch = new Object()
patch.REPLACE = REPLACE
patch.REORDER = REORDER
patch.PROPS = PROPS
patch.TEXT = TEXT
patch.createPatch = createPatch
module.exports = patch
},{}],5:[function(require,module,exports){
module.exports = require('./lib/diff').diff

},{"./lib/diff":6}],6:[function(require,module,exports){
/**
 * Diff two list in O(N).
 * @param {Array} oldList - Original List
 * @param {Array} newList - List After certain insertions, removes, or moves
 * @return {Object} - {moves: <Array>}
 *                  - moves is a list of actions that telling how to remove and insert
 */
function diff (oldList, newList, key) {
  var oldMap = makeKeyIndexAndFree(oldList, key)
  var newMap = makeKeyIndexAndFree(newList, key)

  var newFree = newMap.free

  var oldKeyIndex = oldMap.keyIndex
  var newKeyIndex = newMap.keyIndex

  var moves = []

  // a simulate list to manipulate
  var children = []
  var i = 0
  var item
  var itemKey
  var freeIndex = 0

  // fist pass to check item in old list: if it's removed or not
  while (i < oldList.length) {
    item = oldList[i]
    itemKey = getItemKey(item, key)
    if (itemKey) {
      if (!newKeyIndex.hasOwnProperty(itemKey)) {
        children.push(null)
      } else {
        var newItemIndex = newKeyIndex[itemKey]
        children.push(newList[newItemIndex])
      }
    } else {
      var freeItem = newFree[freeIndex++]
      children.push(freeItem || null)
    }
    i++
  }

  var simulateList = children.slice(0)

  // remove items no longer exist
  i = 0
  while (i < simulateList.length) {
    if (simulateList[i] === null) {
      remove(i)
      removeSimulate(i)
    } else {
      i++
    }
  }

  // i is cursor pointing to a item in new list
  // j is cursor pointing to a item in simulateList
  var j = i = 0
  while (i < newList.length) {
    item = newList[i]
    itemKey = getItemKey(item, key)

    var simulateItem = simulateList[j]
    var simulateItemKey = getItemKey(simulateItem, key)

    if (simulateItem) {
      if (itemKey === simulateItemKey) {
        j++
      } else {
        // new item, just inesrt it
        if (!oldKeyIndex.hasOwnProperty(itemKey)) {
          insert(i, item)
        } else {
          // if remove current simulateItem make item in right place
          // then just remove it
          var nextItemKey = getItemKey(simulateList[j + 1], key)
          if (nextItemKey === itemKey) {
            remove(i)
            removeSimulate(j)
            j++ // after removing, current j is right, just jump to next one
          } else {
            // else insert item
            insert(i, item)
          }
        }
      }
    } else {
      insert(i, item)
    }

    i++
  }

  function remove (index) {
    var move = {index: index, type: 0}
    moves.push(move)
  }

  function insert (index, item) {
    var move = {index: index, item: item, type: 1}
    moves.push(move)
  }

  function removeSimulate (index) {
    simulateList.splice(index, 1)
  }

  return {
    moves: moves,
    children: children
  }
}

/**
 * Convert list to key-item keyIndex object.
 * @param {Array} list
 * @param {String|Function} key
 */
function makeKeyIndexAndFree (list, key) {
  var keyIndex = {}
  var free = []
  for (var i = 0, len = list.length; i < len; i++) {
    var item = list[i]
    var itemKey = getItemKey(item, key)
    if (itemKey) {
      keyIndex[itemKey] = i
    } else {
      free.push(item)
    }
  }
  return {
    keyIndex: keyIndex,
    free: free
  }
}

function getItemKey (item, key) {
  if (!item || !key) return void 666
  return typeof key === 'string'
    ? item[key]
    : key(item)
}

exports.makeKeyIndexAndFree = makeKeyIndexAndFree // exports for test
exports.diff = diff

},{}]},{},[1]);
