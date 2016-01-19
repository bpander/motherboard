define(['./utils/StringUtil'], function (StringUtil) {
    'use strict';


    function XElement () {}


    XElement.mixin = {

        customAttributes: {},

        selector: '',


        createdCallback: function () {
            var attrName;
            var attrDefinition;
            var prop;
            for (attrName in this.customAttributes) {
                attrDefinition = this.customAttributes[attrName];
                prop = StringUtil.toCamelCase(attrName);
                // TODO: This need a closure otherwise attrDefinition will be whatever it was set to last
                Object.defineProperty(this, prop, {
                    get: function () {
                        var attrValue = this.getAttribute(attrName);
                        switch (attrDefinition.type) {
                            case Number:
                                return +attrValue;
                            case String:
                                return attrValue;
                            case Boolean:
                                return attrValue !== null;
                        }
                    },
                    set: function (value) {

                    }
                });
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
