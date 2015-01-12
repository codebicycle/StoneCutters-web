'use strict';

var defaultLocale = 'en-US';
var defaultDictionary = {};

try {
    defaultDictionary = require('../app/translations/' + defaultLocale);
}
catch (e) {}

module.exports = {
    get: function(locale) {
        var dictionary;

        try {
            dictionary = require('../app/translations/' + (locale || defaultLocale));
        }
        catch(e) {}
        return dictionary || defaultDictionary;
    }
};
