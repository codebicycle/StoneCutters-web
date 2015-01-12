'use strict';

var _ = require('underscore');
var translations = require('../../../shared/translations');

module.exports = {
    kilometers: kilometers,
    bathrooms: bathrooms,
    bedrooms: bedrooms,
    surface: surface,
    year: year,
    carbrand: carbrand,
    carmodel: carmodel
};

function buildKilometerRange(to, label, dictionary) {
    return {
        from: 0,
        to: to,
        label: [dictionary['misc.LessThan'], label, dictionary['posting_optionallist.Kms']].join('')
    };
}

function kilometers(filter, options) {
    var dictionary;
    var regexp;
    var label;

    filter = checkRangeValue(filter, options);
    filter = checkDescription(filter, options, 'itemdescription.mileage');
    if (filter.has('otherType')) {
        return filter;
    }

    dictionary = translations.get(options.app.session.get('selectedLanguage'));
    filter.set({
        otherType: 'LIST',
        list: [
            buildKilometerRange(30000, ' 30.000 ', dictionary),
            buildKilometerRange(50000, ' 50.000 ', dictionary),
            buildKilometerRange(80000, ' 80.000 ', dictionary),
            buildKilometerRange(120000, ' 120.000 ', dictionary),
            buildKilometerRange(150000, ' 150.000 ', dictionary)
        ]
    }, {
        unset: false
    });
    return filter;
}

function bathrooms(filter, options) {
    filter = checkRangeValue(filter, options);
    filter = checkDescription(filter, options, 'itemdescription.bathrooms');
    return filter;
}

function bedrooms(filter, options) {
    filter = checkRangeValue(filter, options);
    filter = checkDescription(filter, options, 'itemdescription.bedrooms');
    return filter;
}

function surface(filter, options) {
    filter = checkRangeValue(filter, options);
    filter = checkDescription(filter, options, 'itemdescription.meters');
    return filter;
}

function year(filter, options) {
    filter = checkRangeValue(filter, options);
    filter = checkDescription(filter, options, 'itemdescriptionwiki.year');
    return filter;
}

function carbrand(filter, options) {
    filter = checkSelectValue(filter, options);
    filter = checkDescription(filter, options, 'misc.Brand');
    return filter;
}

function carmodel(filter, options) {
    if (!this.has('carbrand') || !this.get('carbrand').has('current')) {
        return;
    }
    if (this.get('carbrand').get('current').length > 1) {
        return;
    }
    filter = checkSelectValue(filter, options);
    filter = checkDescription(filter, options, 'itemdescriptionwiki.model');
    return filter;
}

function checkRangeValue(filter, options) {
    var dictionary;

    if (!filter.has('value')) {
        dictionary = translations.get(options.app.session.get('selectedLanguage'));
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
        dictionary = translations.get(options.app.session.get('selectedLanguage'));
        filter.set('description', dictionary[key], {
            unset: false
        });
    }
    return filter;
}
