define(['./utils/StringUtil'], function (StringUtil) {
    'use strict';


    function XElement () {}


    XElement.mixin = {

        customAttributes: {},

        selector: '',


        getComponent: function (T, tag) {

        },


        getComponents: function (T, tag) {

        },


        findWithTag: function (tag) {

        },


        findAllWithTag: function (tag) {

        },


        createBinding: function (target, type, handler) {

        },


        trigger: function (type, data) {

        }

    };


    XElement.registerCustomAttribute = function (prototype, attributeName, attributeDef) {
        var prop = StringUtil.toCamelCase(attributeName);
        Object.defineProperty(prototype, prop, {
            get: function () {
                var attrValue = this.getAttribute(attributeName);
                switch (attributeDef.type) {
                    case Number:
                        if (attrValue === null || attrValue.trim() === '' || isNaN(+attrValue)) {
                            attrValue = attributeDef.default;
                        }
                        return +attrValue; // `+` quickly casts to a number

                    case String:
                        if (attrValue === null) {
                            attrValue = attributeDef.default + '';
                        }
                        return attrValue;

                    case Boolean:
                        return attrValue !== null;
                }
            },
            set: function (value) {
                switch (attributeDef.type) {
                    case Number:
                        if (isNaN(+value) ) {
                            break;
                        }
                        this.setAttribute(attributeName, value);
                        break;

                    case String:
                        this.setAttribute(attributeName, value);
                        break;

                    case Boolean:
                        if (!!value) { // `!!` quickly casts to a boolean
                            this.setAttribute(attributeName, '');
                        } else {
                            this.removeAttribute(attributeName);
                        }
                        break;
                }
            }
        });
    };


    XElement.define = function (customTagName, definition) {
        var attributeName;
        var prototype = Object.create(HTMLElement.prototype);
        prototype = Object.assign(prototype, XElement.mixin);
        prototype = Object.assign({}, prototype, definition(prototype)); // It's necessary to create a new object so we can access "super" properties
        for (attributeName in prototype.customAttributes) {
            if (prototype.customAttributes.hasOwnProperty(attributeName)) {
                XElement.registerCustomAttribute(prototype, attributeName, prototype.customAttributes[attributeName]);
            }
        }
        return document.registerElement(customTagName, { prototype: prototype });
    };


    XElement.extend = function () {
        if (typeof argument[0] === 'string') {
            return _extendNative.apply(this, arguments);
        }
        return _extendCustom.apply(this, arguments);
    };


    var _extendNative = function (tagName, customTagName, definition) {

    };


    var _extendCustom = function (T, customTagName, definition) {

    };


    return XElement;
});
