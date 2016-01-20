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
                        // If the attribute is responsive, fallthrough to the String case
                        if (attributeDef.responsive !== true) {
                            if (attrValue === null || attrValue.trim() === '' || isNaN(+attrValue)) {
                                attrValue = attributeDef.default;
                            }
                            return +attrValue; // `+` quickly casts to a number
                        }

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
                        // If the attribute is responsive, fallthrough to the String case
                        if (attributeDef.responsive !== true) {
                            if (isNaN(+value) ) {
                                break;
                            }
                            this.setAttribute(attributeName, value);
                            break;
                        }

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
        if (attributeDef.responsive === true) {
            Object.defineProperty(prototype, 'current' + StringUtil.capitalize(prop), {
                get: function () {
                    // property will be something like "(min-width: 768px) and (min-height: 100px) 3, 1"
                    var definitions = this[prop].split(',').map(function (x) { return x.trim(); });
                    var unmatched = definitions.pop();
                    var matchedValue = definitions.reduce(function (previous, definition) {
                        var parts = definition.split(/\s(?=[^\s]*$)/); // Find last occurence of whitespace and split at it
                        var mediaQuery = parts[0];
                        var value = parts[1];
                        if (window.matchMedia(mediaQuery).matches) {
                            return value;
                        }
                        return previous;
                    }, unmatched);
                    if (attributeDef.type === Number) {
                        matchedValue = +matchedValue;
                    }
                    return matchedValue;
                }
            });
        }
    };


    XElement.define = function (customTagName, definition) {
        var attributeName;

        // Define prototype
        var prototype = Object.create(HTMLElement.prototype);
        Object.assign(prototype, XElement.mixin);
        definition(prototype);

        // Register custom attributes
        for (attributeName in prototype.customAttributes) {
            if (prototype.customAttributes.hasOwnProperty(attributeName)) {
                XElement.registerCustomAttribute(prototype, attributeName, prototype.customAttributes[attributeName]);
            }
        }

        // Register element
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
