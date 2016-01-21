define(function () {
    'use strict';


    function Binding (target, type, handler) {

        this.target = target;

        this.type = type;

        this.handler = handler;

        this.isEnabled = false;

    }


    Binding.prototype.enable = function () {
        if (this.isEnabled === true) {
            return;
        }

        if (this.target instanceof EventTarget) {
            this.target.addEventListener(this.type, this.handler);

        } else if (this.target instanceof NodeList) {
            var i = this.target.length;
            while (--i > -1) {
                this.target[i].addEventListener(this.type, this.handler);
            }
        }
        this.isEnabled = true;
    };


    Binding.prototype.disable = function () {
        if (this.target instanceof EventTarget) {
            this.target.removeEventListener(this.type, this.handler);

        } else if (this.target instanceof NodeList) {
            var i = this.target.length;
            while (--i > -1) {
                this.target[i].removeEventListener(this.type, this.handler);
            }
        }
        this.isEnabled = false;
    };


    return Binding;
});