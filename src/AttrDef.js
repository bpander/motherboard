define(['utils/StringUtil'], function (StringUtil) {
    'use strict';


    function AttrDef (name, params) {

        this.name = name;

        this.type = null;
        
        this.default = null;
        
        this.responsive = false;
        
        this.mediaChangedCallback = Function.prototype; // noop
        
        this.changedCallback = Function.prototype; // noop

        this.set(params);
    }


    AttrDef.prototype.set = function (params) {
        var prop;
        for (prop in params) {
            if (params.hasOwnProperty(prop) && this.hasOwnProperty(prop)) {
                this[prop] = params[prop];
            }
        }
    };


    AttrDef.prototype.getPropertyName = function () {
        return StringUtil.toCamelCase(this.name); // 'attr-name' => 'attrName'
    };


    AttrDef.prototype.getEvaluatedPropertyName = function () {
        return 'current' + StringUtil.capitalize(this.getPropertyName()); // 'attr-name' => 'currentAttrName'
    };


    AttrDef.prototype.parseResponsiveAttribute = function (value) {
        var definitions = value.split(',').map(function (x) { return x.trim(); });
        var unmatched = definitions.pop();
        if (this.type === Number) {
            unmatched = +unmatched;
        }
        return {
            unmatched: unmatched,
            breakpoints: definitions.map(function (definition) {
                var parts = definition.split(/\s(?=[^\s]*$)/); // Find last occurence of whitespace and split at it
                var mediaQuery = parts[0];
                var value = parts[1];
                if (this.type === Number) {
                    value = +value;
                }
                return {
                    mediaQuery: mediaQuery,
                    value: value
                };
            }, this)
        };
    };


    AttrDef.prototype.evaluateResponsiveAttribute = function (value) {
        var parsed = this.parseResponsiveAttribute(value);
        return parsed.breakpoints.reduce(function (previous, breakpoint) {
            if (window.matchMedia(breakpoint.mediaQuery).matches) {
                return breakpoint.value;
            }
            return previous;
        }, parsed.unmatched);
    };


    AttrDef.prototype.addToPrototype = function (prototype) {
        var attrDef = this;
        var prop = this.getPropertyName();
        Object.defineProperty(prototype, prop, {
            get: function () {
                var attrValue = this.getAttribute(attrDef.name);
                switch (attrDef.type) {

                    case Number:
                        // If the attribute is responsive, fallthrough to the String case
                        if (attrDef.responsive !== true) {
                            if (attrValue === null || attrValue.trim() === '' || isNaN(+attrValue)) {
                                attrValue = attrDef.default;
                            }
                            return +attrValue; // `+` quickly casts to a number
                        }

                    case String:
                        if (attrValue === null) {
                            attrValue = attrDef.default + '';
                        }
                        return attrValue;

                    case Boolean:
                        return attrValue !== null;
                }
            },
            set: function (value) {
                switch (attrDef.type) {
                    case Number:
                        // If the attribute is responsive, fallthrough to the String case
                        if (attrDef.responsive !== true) {
                            if (isNaN(+value) ) {
                                break;
                            }
                            this.setAttribute(attrDef.name, value);
                            break;
                        }

                    case String:
                        this.setAttribute(attrDef.name, value);
                        break;

                    case Boolean:
                        if (!!value) { // `!!` quickly casts to a boolean
                            this.setAttribute(attrDef.name, '');
                        } else {
                            this.removeAttribute(attrDef.name);
                        }
                        break;
                }
            }
        });
        if (attrDef.responsive === true) {
            Object.defineProperty(prototype, this.getEvaluatedPropertyName(), {
                get: function () {
                    return attrDef.evaluateResponsiveAttribute(this[prop]);
                }
            });
        }
    };


    return AttrDef;
});
