'use strict';

var defaultLocale = 'en-US';
var defaultDictionary = {};
var dictionaries = {};

try {
    defaultDictionary = require('../app/translations/' + defaultLocale);
}
catch (e) {}

module.exports = {
    get: function(locale) {
        var file = '../app/translations/' + (locale || defaultLocale);

        try {
            dictionaries[file] = dictionaries[file] || require(file);
        }
        catch(e) {
            dictionaries[file] = defaultDictionary;
        }
        return dictionaries[file];
    }
};
