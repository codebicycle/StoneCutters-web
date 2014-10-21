'use strict';

var _ = require('underscore');

var SYMBOLS = {
    persian: ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
};

var EXPRESSIONS = {
    latin: [/0/g, /1/g, /2/g, /3/g, /4/g, /5/g, /6/g, /7/g, /8/g, /9/g],
    persian: ['\u06F0', '\u06F1', '\u06F2', '\u06F3', '\u06F4', '\u06F5', '\u06F6', '\u06F7', '\u06F8', '\u06F9']
};

function toLatin(input) {
    var output = input.toString();

    _.times(10, function translate(digit) {
        output = output.replace(EXPRESSIONS.persian[digit], digit.toString());
    });
    return output;
}

function toPersian(input) {
    var output = input.toString();

    _.times(10, function translate(digit) {
        output = output.replace(EXPRESSIONS.latin[digit], SYMBOLS.persian[digit]);
    });

    return output;
}

module.exports = {
    toLatin: toLatin,
    toPersian: toPersian
};
