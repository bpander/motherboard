define(function (require) {
    'use strict';

    var XElement = require('XElement');
    var XCarousel = require('XCarousel');


    return XElement.extend(XCarousel, 'x-carousel-two', function (proto, base) {

        proto.createdCallback = function () {
            base.createdCallback.call(this);
            console.log('x-carousel-two.createdCallback', this.selector);
        };

    });

});
