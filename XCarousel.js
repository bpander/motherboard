define(['src/XElement'], function (XElement) {
    'use strict';


    return XElement.define('x-carousel', function (proto) {


        proto.customAttributes = {
            'infinite': {
                type: Boolean
            },
            'slides-visible': {
                type: Number,
                responsive: true,
                default: '(min-width: 320px) 2, (min-width: 768px) 3, 1',
                mediaChangedCallback: function (oldVal, newVal) {
                    console.log('mediaChangedCallback', oldVal, newVal);
                }
            },
            'delay': {
                type: Number,
                default: 5000
            },
            'easing': {
                type: String,
                default: 'ease-out',
                changedCallback: function (oldVal, newVal) {
                    console.log('easing changed', oldVal, newVal);
                }
            }
        };


    });
});
