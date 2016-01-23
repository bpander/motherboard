define(function (require) {
    'use strict';

    var XElement = require('XElement');


    return XElement.define('x-carousel', function (proto, base) {

        proto.createdCallback = function () {
            base.createdCallback.call(this);
            console.log('createdCallback');
        };

    });

});
