define(['src/XElement'], function (XElement) {
    'use strict';


    return XElement.define('x-carousel', function (base) {


        var proto = {

            customAttributes: {
                'infinite': { type: Boolean },
                'slides-visible': {
                    type: Number,
                    responsive: true,
                    default: '1, (min-width: 768px)'
                },
                'speed': {
                    type: Number,
                    default: 3000
                },
                'active-class': {
                    type: String,
                    default: 'active'
                }
            }

        };


        return proto;
    });
});
