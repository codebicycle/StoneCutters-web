'use strict';

var _ = require('underscore');
var translations = require('../../../shared/translations');

function checkDescription(filter, options, key) {
    var dictionary;

    if (!filter.has('description')) {
        dictionary = translations[options.app.session.get('selectedLanguage') || 'en-US'];
        filter.set('description', dictionary[key]);
    }
    return filter
}

module.exports = {
    kilometers: function transform(filter, options) {
        var dictionary;
        var regexp;
        var label;

        filter = checkDescription(filter, options, 'itemdescription.mileage');
        if (filter.has('otherType')) {
            return filter;
        }

        dictionary = translations[options.app.session.get('selectedLanguage') || 'en-US'];
        regexp = '[[kilometers]]';
        label = [dictionary['misc.LessThan'], regexp, dictionary['posting_optionallist.Kms']].join('');
        filter.set({
            otherType: 'LIST',
            list: [
                { 
                    from: 0, 
                    to: 30000, 
                    label: label.replace(regexp, ' 30.000 ')
                },
                { 
                    from: 0, 
                    to: 50000, 
                    label: label.replace(regexp, ' 50.000 ')
                },
                { 
                    from: 0, 
                    to: 80000, 
                    label: label.replace(regexp, ' 80.000 ')
                },
                { 
                    from: 0, 
                    to: 120000, 
                    label: label.replace(regexp, ' 120.000 ')
                },
                { 
                    from: 0, 
                    to: 150000, 
                    label: label.replace(regexp, ' 150.000 ')
                }
            ]
        }, {
            unset: false
        });
        return filter;
    },
    bathrooms: function transform(filter, options) {
        return checkDescription(filter, options, 'itemdescription.bathrooms');
    },
    bedrooms: function transform(filter, options) {
        return checkDescription(filter, options, 'itemdescription.bedrooms');
    },
    meters: function transform(filter, options) {
        return checkDescription(filter, options, 'itemdescription.meters');
    },
    year: function transform(filter, options) {
        return checkDescription(filter, options, 'itemdescriptionwiki.year');
    }
};