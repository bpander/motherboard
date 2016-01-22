define(function (require) {
    'use strict';

    var XElement = require('XElement');


    return XElement.define('x-carousel', function (proto, mixin, base) {

        proto.createdCallback = function () {
            mixin.createdCallback.call(this);
            console.log('createdCallback');
        };

    });
});
