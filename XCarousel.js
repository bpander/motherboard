define(['src/XElement'], function (XElement) {
    'use strict';


    return XElement.define('x-carousel', function (proto) {


        proto.customAttributes = {
            'infinite': { type: Boolean },
            'slides-visible': {
                type: Number,
                responsive: true,
                default: '(min-height: 100px) and (min-width: 768px) 3, 1'
            },
            'speed': {
                type: Number,
                default: 3000
            },
            'active-class': {
                type: String,
                default: 'active',
                changedCallback: function (oldVal, newVal) {
                    console.log('active-class changed', oldVal, newVal);
                }
            }
        };


        proto.attributeChangedCallback = function () {
            XElement.mixin.attributeChangedCallback.apply(this, arguments);
            console.log('overwritten');
        };


    });
});
