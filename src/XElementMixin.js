define([
    'src/Binding',
    'src/MediaDef'
], function (
    Binding,
    MediaDef
) {
    'use strict';

    var XElementMixin = {

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


    return XElementMixin;
});
