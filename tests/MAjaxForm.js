define(function (require) {
    'use strict';

    var M = require('motherboard');
    var MForm = require('MForm');

    return M.extend(MForm, 'm-ajax-form', function (proto, base) {

        proto.createdCallback = function () {
            base.createdCallback.call(this);
            console.log('m-ajax-form.createdCallback', this.selector);
        };

    });
});
