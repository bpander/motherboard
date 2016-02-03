define(function (require) {
    'use strict';

    var M = require('motherboard');
    var MCarousel = require('MCarousel');


    return M.extend(MCarousel, 'm-carousel-two', function (proto, base) {

        proto.createdCallback = function () {
            base.createdCallback.call(this);
            console.log('m-carousel-two.createdCallback', this.selector);
        };

    });

});
