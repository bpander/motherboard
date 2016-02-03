define(function (require) {
    'use strict';

    var M = require('motherboard');


    return M.element('m-carousel', function (proto, base) {

        proto.customAttributes = [

            M.attribute('slides-visible', {
                type: Number,
                responsive: true,
                mediaChangedCallback: function (oldVal, newVal) {
                    console.log('mediaChangedCallback', oldVal, newVal);
                }
            })

        ];


        proto.createdCallback = function () {
            base.createdCallback.call(this);
            console.log('m-carousel.createdCallback', this.selector);
        };

    });

});
