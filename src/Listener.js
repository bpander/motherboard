define(function () {
    'use strict';


    function Listener (target, type, handler) {

        this.target = target;

        this.type = type;

        this.handler = handler;

        this.isEnabled = false;

    }


    Listener.prototype.enable = function () {
        if (this.isEnabled === true) {
            return;
        }

        if (this.target instanceof EventTarget) {
            this.target.addEventListener(this.type, this.handler);

        } else if (this.target instanceof Array) {
            var i = this.target.length;
            while (--i > -1) {
                this.target[i].addEventListener(this.type, this.handler);
            }
        }
        this.isEnabled = true;
    };


    Listener.prototype.disable = function () {
        if (this.target instanceof EventTarget) {
            this.target.removeEventListener(this.type, this.handler);

        } else if (this.target instanceof Array) {
            var i = this.target.length;
            while (--i > -1) {
                this.target[i].removeEventListener(this.type, this.handler);
            }
        }
        this.isEnabled = false;
    };


    return Listener;
});