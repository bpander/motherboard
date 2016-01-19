define(function () {
    'use strict';


    var StringUtil = {};


    StringUtil.toCamelCase = function (str) {
        return str.replace(/(\-[a-z])/g, function ($1) {
            return $1.toUpperCase().replace('-','');
        });
    };


    return StringUtil;
});
