define([
    'Listener',
    'MediaDef',
    'polyfills/Object.assign'
], function (
    Listener,
    MediaDef
) {
    'use strict';

    /**
     * This works the same way as Array.prototype.find but without the bloat of the entire polyfill.
     * 
     * @param  {Array}      arr         The array to search.
     * @param  {Function}   predicate   A predicate function.
     * @return {*}  The element in the array that caused the predicate to return true or `undefined` if no match.
     */
    var _find = function (arr, predicate) {
        var match;
        arr.some(function (el, i, arr) {
            if (predicate(el, i, arr)) {
                match = el;
                return true;
            }
        });
        return match;
    };


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
            var attrDef = _find(this.customAttributes, function (x) { return x.name === attrName; });
            if (attrDef === undefined) {
                return;
            }
            attrDef.changedCallback.call(this, oldVal, newVal);

            var mediaDef = _find(this.mediaDefs, function (x) { return x.attrDef === attrDef; });
            if (mediaDef === undefined || document.body.contains(this) === false) {
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


        /**
         * Convenience method for triggering custom events with the CustomEvent API. By default, events triggered with this method will bubble and are cancelable. These attributes can be overwritten via the optional `eventInit` argument.
         *
         * @method trigger
         * @param  {String} type        The event type, e.g. 'beforechange'
         * @param  {Object} [detail]    Optional. Additional data to send with the event (sets the `detail` property of the CustomEvent).
         * @param  {Object} [eventInit] Optional. Overwrites Event attributes e.g. bubbles, cancelable.
         * @return {Boolean}  Returns the value of the Element#dispatch call, i.e. returns `false` if cancelled, otherwise `true`.
         */
        trigger: function (type, detail, eventInit) {
            eventInit = Object.assign({
                detail: detail,
                bubbles: true,
                cancelable: true
            }, eventInit);
            var e = new CustomEvent(type, eventInit);
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
