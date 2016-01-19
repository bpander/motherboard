define(function () {
    'use strict';


    function XElement () {}


    XElement.mixin = {

        customAttributes: {},


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
