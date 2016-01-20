define(function () {
    'use strict';


    var StringUtil = {};


    StringUtil.toCamelCase = function (str) {
        return str.replace(/(\-[a-z])/g, function ($1) {
            return $1.toUpperCase().replace('-','');
        });
    };


    StringUtil.capitalize = function (str) {
        return str.replace(/./, function ($1) {
            return $1.toUpperCase();
        });
    };


    return StringUtil;
});
