define(function (require) {
    'use strict';

    var XElement = require('XElement');
    var XForm = require('XForm');

    return XElement.extend(XForm, 'x-ajax-form', function (proto, base) {

        proto.createdCallback = function () {
            base.createdCallback.call(this);
            console.log('x-ajax-form.createdCallback', this.selector);
        };

    });
});
