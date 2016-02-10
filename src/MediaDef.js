define(function () {
    'use strict';


    function MediaDef (params) {

        this.attrDef =  null;

        this.element =  null;

        this.mqls = [];

        this.listener = Function.prototype; // noop

        this.set(params);
    }


    MediaDef.prototype.set = function (params) {
        var prop;
        for (prop in params) {
            if (params.hasOwnProperty(prop) && this.hasOwnProperty(prop)) {
                this[prop] = params[prop];
            }
        }
    };


    MediaDef.prototype.update = function () {
        this.mqls.forEach(function (mql) {
            mql.removeListener(this.listener);
        }, this);
        this.mqls = [];

        if (document.body.contains(this.element) === false) {
            return;
        }

        var prop = this.attrDef.getPropertyName();
        var parsed = this.attrDef.parseResponsiveAttribute(this.element[prop]);
        var oldVal = parsed.unmatched;

        this.listener = function () {
            var newVal = this.element[this.attrDef.getEvaluatedPropertyName()];
            if (newVal !== oldVal) {
                this.attrDef.mediaChangedCallback.call(this.element, oldVal, newVal);
                oldVal = newVal;
            }
        }.bind(this);

        this.mqls = parsed.breakpoints.map(function (breakpoint) {
            var mql = window.matchMedia(breakpoint.mediaQuery);
            if (mql.matches) {
                oldVal = breakpoint.value;
            }
            mql.addListener(this.listener);
            return mql;
        }, this);
    };


    return MediaDef;
});
