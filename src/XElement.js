define(['./utils/StringUtil'], function (StringUtil) {
    'use strict';


    function XElement () {}

    var _registerCustomAttribute = function (element, attributeName, attributeDef) {
        var prop = StringUtil.toCamelCase(attributeName);
        Object.defineProperty(element, prop, {
            get: function () {
                var attrValue = element.getAttribute(attributeName);
                switch (attributeDef.type) {
                    case Number:
                        if (attrValue === null || attrValue.trim() === '' || isNaN(+attrValue)) {
                            attrValue = attributeDef.default;
                        }
                        return +attrValue; // `+` quickly casts to a number

                    case String:
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
                        break;

                    case Boolean:
                        if (!!value) { // `!!` quickly casts to a boolean
                            element.setAttribute(attributeName, '');
                        } else {
                            element.removeAttribute(attributeName);
                        }
                        break;
                }
            }
        });
    };


    XElement.mixin = {

        customAttributes: {},

        selector: '',


        createdCallback: function () {
            var attributeName;
            for (attributeName in this.customAttributes) {
                if (this.customAttributes.hasOwnProperty(attributeName)) {
                    _registerCustomAttribute(this, attributeName, this.customAttributes[attributeName]);
                }
            }
        },


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


    XElement.define = function (customTagName, definition) {
        var prototype = Object.create(HTMLElement.prototype);
        Object.assign(prototype, XElement.mixin);
        Object.assign(prototype, definition(prototype));
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
