(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
window.svd = {
    el: require('./lib/element')
}
console.log('dfklsdfkl')
},{"./lib/element":2}],2:[function(require,module,exports){

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
},{}]},{},[1]);
