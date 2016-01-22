define([
    './XElementMixin',
    './AttrDef',
    './polyfills/CustomEvent',
    './polyfills/Object.assign',
    '../bower_components/webcomponentsjs/webcomponents-lite.js',
    '../bower_components/matchMedia/matchMedia',
    '../bower_components/matchMedia/matchMedia.addListener'
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
        var base = HTMLElement.prototype;
        var prototype = Object.create(base);
        Object.assign(prototype, XElementMixin);
        Object.defineProperty(prototype, 'selector', { value: customTagName });
        definition(prototype, XElementMixin, base);
        return _register(customTagName, { prototype: prototype });
    };


    XElement.extend = function () {
        if (typeof arguments[0] === 'string') {
            return _extendNative.apply(this, arguments);
        }
        return _extendCustom.apply(this, arguments);
    };


    var _extendNative = function (tagName, customTagName, definition) {
        var base = document.createElement(tagName).constructor.prototype;
        var prototype = Object.create(base);
        Object.assign(prototype, XElementMixin);
        Object.defineProperty(prototype, 'selector', { value: tagName + '[is="' + customTagName + '"]' });
        definition(prototype, XElementMixin, base);

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
        definition(prototype, XElementMixin, base);

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


    return XElement;
});
