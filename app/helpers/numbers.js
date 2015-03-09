'use strict';

var _ = require('underscore');

var EXPRESSIONS = {
    latin: [/0/g, /1/g, /2/g, /3/g, /4/g, /5/g, /6/g, /7/g, /8/g, /9/g],
    persian: ['\u06F0', '\u06F1', '\u06F2', '\u06F3', '\u06F4', '\u06F5', '\u06F6', '\u06F7', '\u06F8', '\u06F9']
};

//  'western-arabic': ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
//  'bengali':        ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'],
//  'devangari':      ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
//  'eastern-arabic': ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'],
//  'persian':        ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

var SYMBOLS = {
    'western-arabic': ['\u0030', '\u0031', '\u0032', '\u0033', '\u0034', '\u0035', '\u0036', '\u0037', '\u0038', '\u0039'],
    'bengali': ['\u09E6', '\u09E7', '\u09E8', '\u09E9', '\u09EA', '\u09EB', '\u09EC', '\u09ED', '\u09EE', '\u09EF'],
    'devangari': ['\u0966', '\u0967', '\u0968', '\u0969', '\u096A', '\u096B', '\u096C', '\u096D', '\u096E', '\u096F'],
    'eastern-arabic': ['\u0660', '\u0661', '\u0662', '\u0663', '\u0664', '\u0665', '\u0666', '\u0667', '\u0668', '\u0669'],
    'persian': ['\u06F0', '\u06F1', '\u06F2', '\u06F3', '\u06F4', '\u06F5', '\u06F6', '\u06F7', '\u06F8', '\u06F9']
};

function toLatin(input) {
    var output;

    if (!input) {
        return input;
    }
    output = input.toString();
    _.times(10, function translate(digit) {
        output = output.replace(EXPRESSIONS.persian[digit], digit.toString());
    });
    return output;
}

function toPersian(input) {
    var output;

    if (!input) {
        return input;
    }
    output = input.toString();
    _.times(10, function translate(digit) {
        output = output.replace(EXPRESSIONS.latin[digit], EXPRESSIONS.persian[digit]);
    });
    return output;
}

function translate(source, options) {
    _.defaults(options, {from: 'western-arabic', to: 'western-arabic'});
    if (source && options.from !== options.to && SYMBOLS[options.from] && SYMBOLS[options.to]) {
        source = source.toString();
        _.times(10, function translate(digit) {
            source = source.split(SYMBOLS[options.from][digit]).join(SYMBOLS[options.to][digit]);
        });
    }
    return source;
}

module.exports = {
    toLatin: toLatin,
    toPersian: toPersian,
    translate: translate
};
