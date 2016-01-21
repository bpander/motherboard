define(['src/XElement', 'XCarousel'], function (XElement, XCarousel) {
    'use strict';

    return XElement.define('x-compound', function (proto, mixin, base) {

        proto.createdCallback = function () {
            mixin.createdCallback.call(this);
            var carousels = this.getComponents(XCarousel, 'foo');
            this.createBinding(carousels, 'click', function (e) {
                console.log('click', e);
            });
            this.createBinding(carousels, 'foo', function (e) {
                console.log('foo', e);
            });
            this.enable();
        };


    });

});
