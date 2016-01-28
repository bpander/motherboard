define([
    'XElementMixin',
    'AttrDef',
], function (
    XElementMixin,
    AttrDef
) {
    'use strict';


    function XElement () {}


    XElement.attribute = function (name, params) {
        return new AttrDef(name, params);
    };


    XElement.define = function (customTagName, definition) {
        var constructor = HTMLElement;
        var base = Object.assign(Object.create(constructor.prototype), XElementMixin);
        var prototype = Object.create(base);
        Object.defineProperty(prototype, 'selector', { value: customTagName });
        definition(prototype, base);
        return _register(customTagName, { prototype: prototype });
    };


    XElement.extend = function () {
        if (typeof arguments[0] === 'string') {
            return _extendNative.apply(this, arguments);
        }
        return _extendCustom.apply(this, arguments);
    };


    var _extendNative = function (tagName, customTagName, definition) {
        var constructor = document.createElement(tagName).constructor;
        var base = Object.assign(Object.create(constructor.prototype), XElementMixin);
        var prototype = Object.create(base);
        Object.defineProperty(prototype, 'selector', { value: tagName + '[is="' + customTagName + '"]' });
        definition(prototype, base);
        return _register(customTagName, { prototype: prototype, extends: tagName });
    };


    var _extendCustom = function (T, customTagName, definition) {
        var options = {};
        var selector;
        var selectorParts = T.prototype.selector.split('[');
        var extendsNative = selectorParts.length > 1;
        if (extendsNative) {
            options.extends = selectorParts[0];
            selector = options.extends + '[is="' + customTagName + '"]';
        } else {
            selector = customTagName;
        }
        var base = T.prototype;
        var prototype = Object.create(base);
        Object.defineProperty(prototype, 'selector', { value: selector });
        definition(prototype, base);

        options.prototype = prototype;
        return _register(customTagName, options);
    };


    var _register = function (customTagName, options) {

        // Register custom attributes
        var prototype = options.prototype;
        prototype.customAttributes.forEach(function (attrDef) {
            attrDef.addToPrototype(prototype);
        });

        // Register the custom element
        return document.registerElement(customTagName, options);
    };


    XElement.setTag = function (element, tag) {
        element.dataset.tag = tag;
    };


    XElement.getTag = function (element) {
        return element.dataset.tag;
    };


    return XElement;
});
