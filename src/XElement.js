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
            this.mediaDefs = this.customAttributes.map(function (attrDef) {
                var mediaDef = new MediaDef({
                    element: this,
                    attrDef: attrDef
                });
                return mediaDef;
            }, this);
        },


        attachedCallback: function () {
            this.mediaDefs.forEach(function (mediaDef) {
                mediaDef.update();
            });
            var attrName;
            var attrDef;
            for (attrName in this.customAttributes) {
                if (this.customAttributes.hasOwnProperty(attrName)) {
                    attrDef = this.customAttributes[attrName];
                    if (attrDef.responsive === true) {
                        XElement.updateResponsiveAttribute(this, attrName, attrDef);
                    }
                }
            }
        },


        detachedCallback: function () {
            var attrName;
            var attrDef;
            for (attrName in this.customAttributes) {
                if (this.customAttributes.hasOwnProperty(attrName)) {
                    attrDef = this.customAttributes[attrName];
                    if (attrDef.responsive === true) {
                        XElement.removeAttributeMqDefinitions(this, attrName);
                    }
                }
            }
        },


        attributeChangedCallback: function (attrName, oldVal, newVal) {
            var attrDef = this.customAttributes[attrName];
            if (attrDef === undefined) {
                return;
            }
            var oldProp;
            var oldEvaluatedProp;
            var newEvaluatedProp;
            var currentProp = 'current' + StringUtil.capitalize(StringUtil.toCamelCase(attrName));
            if (attrDef.responsive === true && document.contains(this)) {
                oldProp = (oldVal === null) ? '' + attrDef.default : oldVal;
                oldEvaluatedProp = AttrDef.evaluateResponsiveAttribute(oldProp, attrDef.type);
                XElement.updateResponsiveAttribute(this, attrName, attrDef);
                newEvaluatedProp = this[currentProp];
                if (oldEvaluatedProp !== newEvaluatedProp && attrDef.mediaChangedCallback instanceof Function) {
                    attrDef.mediaChangedCallback.call(this, oldEvaluatedProp, newEvaluatedProp);
                }
            }
            if (attrDef.changedCallback !== undefined) {
                attrDef.changedCallback.call(this, oldVal, newVal);
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


    XElement.removeAttributeMqDefinitions = function (instance, attrName) {
        var mqDef;
        var i = instance.mediaDefs.length;

        // Loop backwards because we're potetially going to remove items from the array
        while ((mqDef = instance.mediaDefs[--i]) !== undefined) {
            if (mqDef.attribute !== attrName) {
                continue;
            }
            mqDef.mql.removeListener(mqDef.mqlListner);
            instance.mediaDefs.splice(i, 1);
        }
    };


    XElement.updateResponsiveAttribute = function (instance, attrName, attrDef) {
        XElement.removeAttributeMqDefinitions(instance, attrName);
        var prop = StringUtil.toCamelCase(attrName);
        var parsed = AttrDef.parseResponsiveAttribute(instance[prop], attrDef.type);
        var oldVal = parsed.unmatched;
        parsed.breakpoints.forEach(function (breakpoint) {
            var mql = window.matchMedia(breakpoint.mediaQuery);
            if (mql.matches) {
                oldVal = breakpoint.value;
            }
            var mqlListner = function () {
                var currentProp = 'current' + StringUtil.capitalize(prop);
                var newVal = instance[currentProp];
                if (newVal !== oldVal) {
                    if (attrDef.mediaChangedCallback instanceof Function) {
                        attrDef.mediaChangedCallback.call(instance, oldVal, newVal);
                    }
                    oldVal = newVal;
                }
            };
            mql.addListener(mqlListner);
            instance.mediaDefs.push({
                mql: mql,
                mqlListner: mqlListner,
                attribute: attrName
            });
        });
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
