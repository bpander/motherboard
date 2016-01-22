define(function () {
    'use strict';


    function MediaDef (params) {

        this.params = Object.assign({

            attrDef: null,

            element: null

        }, params);

        this.mqls = [];

        this.listener = Function.prototype; // noop

    }


    MediaDef.prototype.update = function () {
        this.mqls.forEach(function (mql) {
            mql.removeListener(this.listener);
        }, this);
        this.mqls = [];

        if (document.contains(this.params.element) === false) {
            return;
        }

        var prop = this.params.attrDef.getPropertyName();
        var parsed = this.params.attrDef.parseResponsiveAttribute(this.params.element[prop]);
        var oldVal = parsed.unmatched;

        this.listener = function () {
            var newVal = this.params.element[this.params.attrDef.getEvaluatedPropertyName()];
            if (newVal !== oldVal) {
                this.params.attrDef.params.mediaChangedCallback.call(this.params.element, oldVal, newVal);
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
