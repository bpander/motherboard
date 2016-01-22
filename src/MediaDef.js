define(function () {
    'use strict';


    function MediaDef (params) {

        this.params = Object.assign({

            attrDef: null,

            element: null

        }, params);

        this.mql = null;

        this.listener = Function;

    }


    MediaDef.prototype.update = function () {
        var prop = this.attrDef.getPropertyName();
        var parsed = this.attrDef.parseResponsiveAttribute(this.element[prop]);

        if (this.mql !== null) {
            this.mql.removeListener(this.listener);
        }

        if (document.contains(this.params.element) === false) {
            return;
        }

        var media = parsed.breakpoints.join();
        this.listener = function () {

        };

        parsed.breakpoints.forEach(function (breakpoint) {
            var mql = window.matchMedia(breakpoint.mediaQuery);
            if (mql.matches) {
                oldVal = breakpoint.value;
            }
            var mqlListner = function () {
                var currentProp = 'current' + StringUtil.capitalize(prop);
                var newVal = instance[currentProp];
                if (newVal !== oldVal) {
                    if (attrDef.mediaChangedCallback instanceof Function) {
                        attrDef.mediaChangedCallback.call(instance, oldVal, newVal);
                    }
                    oldVal = newVal;
                }
            };
            mql.addListener(mqlListner);
            instance.mediaDefs.push({
                mql: mql,
                mqlListner: mqlListner,
                attribute: attrName
            });
        });
    };


    return MediaDef;
});
