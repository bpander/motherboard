define(['src/utils/StringUtil'], function (StringUtil) {
    'use strict';


    function AttrDef (params) {

        this.params = Object.assign({
            type: null,
            default: null,
            responsive: false,
            mediaChangedCallback: Function,
            changedCallback: Function
        }, params);

    }


    AttrDef.create = function (params) {
        return new AttrDef(params);
    };


    AttrDef.getPropertyName = function (attrName) {
        return StringUtil.toCamelCase(attrName); // 'attr-name' => 'attrName'
    };


    AttrDef.getEvaluatedPropertyName = function (attrName) {
        return 'current' + StringUtil.capitalize(AttrDef.getPropertyName(attrName)); // 'attr-name' => 'currentAttrName'
    };


    AttrDef.parseResponsiveAttribute = function (value, type) {
        var definitions = value.split(',').map(function (x) { return x.trim(); });
        var unmatched = definitions.pop();
        if (type === Number) {
            unmatched = +unmatched;
        }
        return {
            unmatched: unmatched,
            breakpoints: definitions.map(function (definition) {
                var parts = definition.split(/\s(?=[^\s]*$)/); // Find last occurence of whitespace and split at it
                var mediaQuery = parts[0];
                var value = parts[1];
                if (type === Number) {
                    value = +value;
                }
                return {
                    mediaQuery: mediaQuery,
                    value: value
                };
            })
        };
    };


    AttrDef.evaluateResponsiveAttribute = function (value, type) {
        var parsed = AttrDef.parseResponsiveAttribute(value, type);
        return parsed.breakpoints.reduce(function (previous, breakpoint) {
            if (window.matchMedia(breakpoint.mediaQuery).matches) {
                return breakpoint.value;
            }
            return previous;
        }, parsed.unmatched);
    };


    AttrDef.prototype.addToPrototype = function (prototype, attrName) {
        var attrDef = this.params;
        var prop = AttrDef.getPropertyName(attrName);
        Object.defineProperty(prototype, prop, {
            get: function () {
                var attrValue = this.getAttribute(attrName);
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
                            this.setAttribute(attrName, value);
                            break;
                        }

                    case String:
                        this.setAttribute(attrName, value);
                        break;

                    case Boolean:
                        if (!!value) { // `!!` quickly casts to a boolean
                            this.setAttribute(attrName, '');
                        } else {
                            this.removeAttribute(attrName);
                        }
                        break;
                }
            }
        });
        if (attrDef.responsive === true) {
            Object.defineProperty(prototype, AttrDef.getEvaluatedPropertyName(attrName), {
                get: function () {
                    return AttrDef.evaluateResponsiveAttribute(this[prop], attrDef.type);
                }
            });
        }
    };


    return AttrDef;
});
