define(function (require) {
    'use strict';

    var XElement = require('XElement');

    return XElement.extend('form', 'x-form', function (proto, base) {

        proto.createdCallback = function () {
            base.createdCallback.call(this);
            console.log('x-form.createdCallback', this.selector);
            this.createBinding(this, 'submit', function (e) {
                e.preventDefault();
                this.submit();
            });
            this.enable();
        };


        proto.submit = function () {
            console.log('submit');
        };

    });
});
