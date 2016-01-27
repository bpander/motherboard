define(function (require) {
    'use strict';

    var XElement = require('XElement');

    return XElement.extend('form', 'x-form', function (proto, base) {


        proto.customAttributes = [
            XElement.attribute('default-number', { type: Number, default: 42 }),
            XElement.attribute('default-string', { type: String, default: 'aaa' }),
            XElement.attribute('no-nothing'),
            XElement.attribute('no-default-number', { type: Number }),
            XElement.attribute('no-default-string', { type: String }),
            XElement.attribute('no-default-boolean', { type: Boolean }),
            XElement.attribute('no-default-responsive-string', { type: String, responsive: true }),
            XElement.attribute('no-default-responsive-number', { type: Number, responsive: true })
        ];


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
