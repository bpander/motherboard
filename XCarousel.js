define(['src/XElement'], function (XElement) {
    'use strict';


    return XElement.define('x-carousel', function (proto) {


        proto.customAttributes = {
            'infinite': { type: Boolean },
            'slides-visible': {
                type: Number,
                responsive: true,
                default: '1, (min-width: 768px) 3'
            },
            'speed': {
                type: Number,
                default: 3000
            },
            'active-class': {
                type: String,
                default: 'active'
            }
        };


    });
});
