define(function (require) {
    'use strict';

    var M = require('motherboard');

    return M.extend('form', 'm-form', function (proto, base) {


        proto.customAttributes = [
            M.attribute('default-number', { type: Number, default: 42 }),
            M.attribute('default-string', { type: String, default: 'aaa' }),
            M.attribute('no-nothing'),
            M.attribute('no-default-number', { type: Number }),
            M.attribute('no-default-string', { type: String }),
            M.attribute('no-default-boolean', { type: Boolean }),
            M.attribute('no-default-responsive-string', { type: String, responsive: true }),
            M.attribute('no-default-responsive-number', { type: Number, responsive: true })
        ];


        proto.createdCallback = function () {
            base.createdCallback.call(this);
            console.log('m-form.createdCallback', this.selector);
            this.listen(this, 'submit', function (e) {
                e.preventDefault();
                this.submit();
            });
            this.enable();
        };


        proto.submit = function () {
            var cancelled = !this.trigger('beforesubmit');
            console.log('beforesubmit cancelled?', cancelled);
        };

    });
});
