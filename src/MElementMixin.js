define([
    'Listener',
    'MediaDef'
], function (
    Listener,
    MediaDef
) {
    'use strict';

    var MElementMixin = {

        customAttributes: [],


        createdCallback: function () {
            this.listeners = [];
            this.mediaDefs = this.customAttributes
                .filter(function (x) { return x.responsive === true; })
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
            attrDef.changedCallback.call(this, oldVal, newVal);

            var mediaDef = this.mediaDefs.find(function (x) { return x.attrDef === attrDef; });
            if (mediaDef === undefined || document.contains(this) === false) {
                return;
            }

            mediaDef.update();

            var oldProp = (oldVal === null) ? '' + attrDef.default : oldVal;
            var oldEvaluatedProp = attrDef.evaluateResponsiveAttribute(oldProp);
            var newEvaluatedProp = this[attrDef.getEvaluatedPropertyName()];
            if (oldEvaluatedProp !== newEvaluatedProp) {
                attrDef.mediaChangedCallback.call(this, oldEvaluatedProp, newEvaluatedProp);
            }
        },


        // TODO: Maybe refactor element queries to use getElementsByTagName? http://jsperf.com/exhaustive-selector-performance-test


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
            return _nodeListToArray(this.querySelectorAll(selector));
        },


        findWithTag: function (tag) {
            return this.querySelector('[data-tag="' + tag + '"]');
        },


        findAllWithTag: function (tag) {
            return _nodeListToArray(this.querySelectorAll('[data-tag="' + tag + '"]'));
        },


        listen: function (target, type, handler) {
            var listener = new Listener(target, type, handler.bind(this));
            this.listeners.push(listener);
            return listener;
        },


        enable: function () {
            var i;
            var l = this.listeners.length;
            for (i = 0; i < l; i++) {
                this.listeners[i].enable();
            }
        },


        disable: function () {
            var i;
            var l = this.listeners.length;
            for (i = 0; i < l; i++) {
                this.listeners[i].disable();
            }
        },


        trigger: function (type, detail) {
            var e = new CustomEvent(type, { detail: detail, bubbles: true });
            return this.dispatchEvent(e);
        }

    };


    var _nodeListToArray = function (nodeList) {
        var l = nodeList.length;
        var arr = new Array(l); // Setting the length first speeds up the conversion
        for (var i = 0; i < l; i++) {
            arr[i] = nodeList[i];
        }
        return arr;
    };


    return MElementMixin;
});
