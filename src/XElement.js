define([
    './utils/StringUtil',
    './AttrDef',
    './MediaDef',
    './Binding',
    './polyfills/CustomEvent',
    './polyfills/Object.assign',
    '../bower_components/webcomponentsjs/webcomponents-lite.js',
    '../bower_components/matchMedia/matchMedia',
    '../bower_components/matchMedia/matchMedia.addListener'
], function (
    StringUtil,
    AttrDef,
    MediaDef,
    Binding
) {
    'use strict';


    function XElement () {}


    XElement.mixin = {

        customAttributes: [],


        createdCallback: function () {
            this.bindings = [];
            this.mediaDefs = this.customAttributes
                .filter(function (x) { return x.params.responsive === true; })
                .map(function (attrDef) {
                    return new MediaDef({
                        element: this,
                        attrDef: attrDef
                    });
                }, this);
        },


        attachedCallback: function () {
            this.mediaDefs.forEach(function (mediaDef) {
                mediaDef.update();
            });
        },


        detachedCallback: function () {
            this.mediaDefs.forEach(function (mediaDef) {
                mediaDef.update();
            });
        },


        attributeChangedCallback: function (attrName, oldVal, newVal) {
            var attrDef = this.customAttributes.find(function (x) { return x.name === attrName; });
            if (attrDef === undefined) {
                return;
            }
            attrDef.params.changedCallback.call(this, oldVal, newVal);

            var mediaDef = this.mediaDefs.find(function (x) { return x.params.attrDef === attrDef; });
            if (mediaDef === undefined || document.contains(this) === false) {
                return;
            }

            mediaDef.update();

            var oldProp = (oldVal === null) ? '' + attrDef.params.default : oldVal;
            var oldEvaluatedProp = attrDef.evaluateResponsiveAttribute(oldProp);
            var newEvaluatedProp = this[attrDef.getEvaluatedPropertyName()];
            if (oldEvaluatedProp !== newEvaluatedProp) {
                attrDef.params.mediaChangedCallback.call(this, oldEvaluatedProp, newEvaluatedProp);
            }
        },


        getComponent: function (T, tag) {
            var selector = T.prototype.selector;
            if (tag !== undefined) {
                selector += '[data-tag="' + tag + '"]';
            }
            return this.querySelector(selector);
        },


        getComponents: function (T, tag) {
            var selector = T.prototype.selector;
            if (tag !== undefined) {
                selector += '[data-tag="' + tag + '"]';
            }
            return this.querySelectorAll(selector);
        },


        findWithTag: function (tag) {
            return this.querySelector('[data-tag="' + tag + '"]');
        },


        findAllWithTag: function (tag) {
            return this.querySelectorAll('[data-tag="' + tag + '"]');
        },


        createBinding: function (target, type, handler) {
            var binding = new Binding(target, type, handler);
            this.bindings.push(binding);
            return binding;
        },


        enable: function () {
            var i;
            var l = this.bindings.length;
            for (i = 0; i < l; i++) {
                this.bindings[i].enable();
            }
        },


        disable: function () {
            var i;
            var l = this.bindings.length;
            for (i = 0; i < l; i++) {
                this.bindings[i].disable();
            }
        },


        trigger: function (type, detail) {
            var e = new CustomEvent(type, { detail: detail });
            return this.dispatchEvent(e);
        }

    };


    XElement.attribute = function (name, params) {
        return new AttrDef(name, params);
    };


    XElement.define = function (customTagName, definition) {
        var base = HTMLElement.prototype;
        var prototype = Object.create(base);
        Object.assign(prototype, XElement.mixin);
        Object.defineProperty(prototype, 'selector', { value: customTagName });
        definition(prototype, XElement.mixin, base);
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
        Object.assign(prototype, XElement.mixin);
        Object.defineProperty(prototype, 'selector', { value: tagName + '[is="' + customTagName + '"]' });
        definition(prototype, XElement.mixin, base);

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
        definition(prototype, XElement.mixin, base);

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
