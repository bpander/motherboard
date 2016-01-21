define([
    './utils/StringUtil',
    './Binding',
    './polyfills/CustomEvent',
    './polyfills/Object.assign',
    '../bower_components/webcomponentsjs/webcomponents-lite.js',
    '../bower_components/matchMedia/matchMedia',
    '../bower_components/matchMedia/matchMedia.addListener'
], function (
    StringUtil,
    Binding
) {
    'use strict';


    function XElement () {}


    XElement.mixin = {

        customAttributes: {},


        createdCallback: function () {
            this.bindings = [];
            this.mqDefs = [];
        },


        attachedCallback: function () {
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
                oldEvaluatedProp = XElement.evaluateResponsiveAttribute(oldProp, attrDef.type);
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


    XElement.registerCustomAttribute = function (prototype, attrName, attrDef) {
        var prop = StringUtil.toCamelCase(attrName);
        Object.defineProperty(prototype, prop, {
            get: function () {
                var attrValue = this.getAttribute(attrName);
                switch (attrDef.type) {

                    case Number:
                        // If the attribute is responsive, fallthrough to the String case
                        if (attrDef.responsive !== true) {
                            if (attrValue === null || attrValue.trim() === '' || isNaN(+attrValue)) {
                                attrValue = attrDef.default;
                            }
                            return +attrValue; // `+` quickly casts to a number
                        }

                    case String:
                        if (attrValue === null) {
                            attrValue = attrDef.default + '';
                        }
                        return attrValue;

                    case Boolean:
                        return attrValue !== null;
                }
            },
            set: function (value) {
                switch (attrDef.type) {
                    case Number:
                        // If the attribute is responsive, fallthrough to the String case
                        if (attrDef.responsive !== true) {
                            if (isNaN(+value) ) {
                                break;
                            }
                            this.setAttribute(attrName, value);
                            break;
                        }

                    case String:
                        this.setAttribute(attrName, value);
                        break;

                    case Boolean:
                        if (!!value) { // `!!` quickly casts to a boolean
                            this.setAttribute(attrName, '');
                        } else {
                            this.removeAttribute(attrName);
                        }
                        break;
                }
            }
        });
        if (attrDef.responsive === true) {
            Object.defineProperty(prototype, 'current' + StringUtil.capitalize(prop), {
                get: function () {
                    return XElement.evaluateResponsiveAttribute(this[prop], attrDef.type);
                }
            });
        }
    };


    XElement.parseResponsiveAttribute = function (value, type) {
        var definitions = value.split(',').map(function (x) { return x.trim(); });
        var unmatched = definitions.pop();
        if (type === Number) {
            unmatched = +unmatched;
        }
        return {
            unmatched: unmatched,
            breakpoints: definitions.map(function (definition) {
                var parts = definition.split(/\s(?=[^\s]*$)/); // Find last occurence of whitespace and split at it
                var mediaQuery = parts[0];
                var value = parts[1];
                if (type === Number) {
                    value = +value;
                }
                return {
                    mediaQuery: mediaQuery,
                    value: value
                };
            })
        };
    };


    XElement.evaluateResponsiveAttribute = function (value, type) {
        var parsed = XElement.parseResponsiveAttribute(value, type);
        return parsed.breakpoints.reduce(function (previous, breakpoint) {
            if (window.matchMedia(breakpoint.mediaQuery).matches) {
                return breakpoint.value;
            }
            return previous;
        }, parsed.unmatched);
    };


    XElement.removeAttributeMqDefinitions = function (instance, attrName) {
        var mqDef;
        var i = instance.mqDefs.length;

        // Loop backwards because we're potetially going to remove items from the array
        while ((mqDef = instance.mqDefs[--i]) !== undefined) {
            if (mqDef.attribute !== attrName) {
                continue;
            }
            mqDef.mql.removeListener(mqDef.mqlListner);
            instance.mqDefs.splice(i, 1);
        }
    };


    XElement.updateResponsiveAttribute = function (instance, attrName, attrDef) {
        XElement.removeAttributeMqDefinitions(instance, attrName);
        var prop = StringUtil.toCamelCase(attrName);
        var parsed = XElement.parseResponsiveAttribute(instance[prop], attrDef.type);
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
            instance.mqDefs.push({
                mql: mql,
                mqlListner: mqlListner,
                attribute: attrName
            });
        });
    };


    XElement.define = function (customTagName, definition) {
        var attrName;

        // Define prototype
        var base = HTMLElement.prototype;
        var prototype = Object.create(base);
        Object.assign(prototype, XElement.mixin);
        Object.defineProperty(prototype, 'selector', { value: customTagName });
        definition(prototype, XElement.mixin, base);

        // Register custom attributes
        for (attrName in prototype.customAttributes) {
            if (prototype.customAttributes.hasOwnProperty(attrName)) {
                XElement.registerCustomAttribute(prototype, attrName, prototype.customAttributes[attrName]);
            }
        }

        // Register element
        return document.registerElement(customTagName, { prototype: prototype });
    };


    XElement.extend = function () {
        if (typeof arguments[0] === 'string') {
            return _extendNative.apply(this, arguments);
        }
        return _extendCustom.apply(this, arguments);
    };


    var _extendNative = function (tagName, customTagName, definition) {
        var attrName;

        // Define prototype
        var base = document.createElement(tagName).constructor.prototype;
        var prototype = Object.create(base);
        Object.assign(prototype, XElement.mixin);
        Object.defineProperty(prototype, 'selector', { value: tagName + '[is="' + customTagName + '"]' });
        definition(prototype, XElement.mixin, base);

        // Register custom attributes
        for (attrName in prototype.customAttributes) {
            if (prototype.customAttributes.hasOwnProperty(attrName)) {
                XElement.registerCustomAttribute(prototype, attrName, prototype.customAttributes[attrName]);
            }
        }

        // Register element
        return document.registerElement(customTagName, { prototype: prototype, extends: tagName });
    };


    var _extendCustom = function (T, customTagName, definition) {
        var options = {};
        var selector;
        var selectorParts = T.prototype.selector.split('[');
        var extendsNative = selectorParts.length > 1;
        if (extendsNative) {
            options.extends = selectorParts[0];
            selector = selectorParts[0] + '[is="' + customTagName + '"]';
        } else {
            selector = customTagName;
        }
        var base = T.prototype;
        var prototype = Object.create(base);
        Object.defineProperty(prototype, 'selector', { value: selector });
        definition(prototype, XElement.mixin, base);

        // Register custom attributes
        var attrName;
        for (attrName in prototype.customAttributes) {
            if (prototype.customAttributes.hasOwnProperty(attrName)) {
                XElement.registerCustomAttribute(prototype, attrName, prototype.customAttributes[attrName]);
            }
        }

        options.prototype = prototype;
        return document.registerElement(customTagName, options);
    };


    return XElement;
});
