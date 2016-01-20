define(['src/XElement'], function (XElement) {
    'use strict';


    return XElement.define('x-carousel', function (proto) {


        proto.customAttributes = {
            'infinite': { type: Boolean },
            'slides-visible': {
                type: Number,
                responsive: true,
                default: '(min-width: 320px) 2, (min-width: 768px) 3, 1',
                mediaChangedCallback: function (oldVal, newVal) {
                    console.log('mediaChangedCallback', oldVal, newVal);
                }
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
