define(['src/XElement'], function (XElement) {
    'use strict';


    return XElement.define('x-carousel', function (base) {


        var proto = {

            customAttributes: {
                'infinite': { type: Boolean },
                'speed': {
                    type: Number,
                    default: 3000
                }
            }

        };


        return proto;
    });
});
