define(['src/XElement'], function (XElement) {
    'use strict';

    return XElement.extend('form', 'x-form', function (proto, mixin, base) {

        proto.createdCallback = function () {
            mixin.createdCallback.call(this);
            console.log('x-form createdCallback');
        };


    });
});