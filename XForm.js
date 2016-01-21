define(['src/XElement'], function (XElement) {
    'use strict';

    return XElement.extend('form', 'x-form', function (proto, mixin, base) {

        proto.createdCallback = function () {
            mixin.createdCallback.call(this);
            console.log('x-form createdCallback');
            this.createBinding(this, 'click', function () {
                console.log('click', this);
            });
            this.enable();
        };


    });
});