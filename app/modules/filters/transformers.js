'use strict';

var _ = require('underscore');
var translations = require('../../../shared/translations');

module.exports = {
    kilometers: function transform(filter, options) {
        if (filter.has('otherType')) {
            return filter;
        }
        var app = options.app;
        var regexp = '[[kilometers]]';
        var dictionary = translations[app.session.get('selectedLanguage') || 'en-US'];
        var label = [dictionary['misc.LessThan'], regexp, dictionary['posting_optionallist.Kms']].join('');

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
        return filter;
    }
};