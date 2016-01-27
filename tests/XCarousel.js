define(function (require) {
    'use strict';

    var XElement = require('XElement');


    return XElement.define('x-carousel', function (proto, base) {

        proto.customAttributes = [
            XElement.attribute('slides-visible', {
                type: Number,
                responsive: true,
                mediaChangedCallback: function (oldVal, newVal) {
                    console.log('mediaChangedCallback', oldVal, newVal);
                }
            })
        ];


        proto.createdCallback = function () {
            base.createdCallback.call(this);
            console.log('x-carousel.createdCallback', this.selector);
        };

    });

});
