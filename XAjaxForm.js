define(['src/XElement', 'XForm'], function (XElement, XForm) {
    'use strict';

    return XElement.extend(XForm, 'x-ajax-form', function (proto, mixin, base) {

        proto.createdCallback = function () {
            base.createdCallback.call(this);
            console.log('x-ajax-form');
        };

    });
});
