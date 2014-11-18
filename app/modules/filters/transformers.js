'use strict';

var _ = require('underscore');
var translations = require('../../../shared/translations');

function checkRangeValue(filter, options) {
    var dictionary;

    if (!filter.has('value')) {
        dictionary = translations[options.app.session.get('selectedLanguage') || 'en-US'];
        filter.set('value', [{
            id: 'from',
            value: dictionary['misc.Min'],
            count: 0
        }, {
            id: 'to',
            value: dictionary['misc.Max'],
            count: 0
        }], {
            unset: false
        });
    }
    return filter;
}

function checkSelectValue(filter, options) {
    var current;
    if (!filter.has('value') && filter.has('current')) {
        current = filter.get('current');
        current = (_.isArray(current) ? _.clone(current) : [current]);
        filter.set('value', _.map(current, function each(value) {
            return {
                id: value,
                value: value
            };
        }), {
            unset: false
        });
    }
    return filter;
}

function checkDescription(filter, options, key) {
    var dictionary;

    if (!filter.has('description')) {
        dictionary = translations[options.app.session.get('selectedLanguage') || 'en-US'];
        filter.set('description', dictionary[key], {
            unset: false
        });
    }
    return filter;
}

module.exports = {
    kilometers: function transform(filter, options) {
        var dictionary;
        var regexp;
        var label;

        filter = checkRangeValue(filter, options);
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
        filter = checkRangeValue(filter, options);
        filter = checkDescription(filter, options, 'itemdescription.bathrooms');
        return filter;
    },
    bedrooms: function transform(filter, options) {
        filter = checkRangeValue(filter, options);
        filter = checkDescription(filter, options, 'itemdescription.bedrooms');
        return filter;
    },
    meters: function transform(filter, options) {
        filter = checkRangeValue(filter, options);
        filter = checkDescription(filter, options, 'itemdescription.meters');
        return filter;
    },
    year: function transform(filter, options) {
        filter = checkRangeValue(filter, options);
        filter = checkDescription(filter, options, 'itemdescriptionwiki.year');
        return filter;
    },
    carbrand: function transform(filter, options) {
        filter = checkSelectValue(filter, options);
        filter = checkDescription(filter, options, 'misc.Brand');
        return filter;
    },
    carmodel: function transform(filter, options) {
        if (!this.has('carbrand') || !this.get('carbrand').has('current')) {
            return;
        }
        filter = checkSelectValue(filter, options);
        filter = checkDescription(filter, options, 'itemdescriptionwiki.model');
        return filter;
    }
};
