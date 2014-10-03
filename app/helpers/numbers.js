'use strict';

var _ = require('underscore');

var SYMBOLS = {
	persian: ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
}

var EXPRESSIONS = {
	roman: [/0/g, /1/g, /2/g, /3/g, /4/g, /5/g, /6/g, /7/g, /8/g, /9/g],
	persian: [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g]
}

function toRoman(input) {
	var output = input.toString();

	_.times(10, function translate(digit) {
		output = output.replace(EXPRESSIONS.persian[digit], digit);
	})

	return output;
}

function toPersian(input) {
	var output = input.toString();

	_.times(10, function translate(digit) {
		output = output.replace(EXPRESSIONS.roman[digit], SYMBOLS.persian[digit]);
	})

	return output;
}

module.exports = {
    toRoman: toRoman,
    toPersian: toPersian
};
