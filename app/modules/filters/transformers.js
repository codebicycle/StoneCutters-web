'use strict';

var _ = require('underscore');
var translations = require('../../../shared/translations');
var selectReplaces = {
    regexpFind: /_|-/g,
    characters: {
        '_': '+',
        '-': '*'
    }
};

module.exports = {
    byType: {
        SELECT: select
    },
    byName: {
        neighborhood: neighborhood,
        kilometers: kilometers,
        bathrooms: bathrooms,
        bedrooms: bedrooms,
        carbrand: carbrand,
        carmodel: carmodel,
        surface: surface,
        state: state,
        city: city,
        year: year,
        age: age,
        flo: flo,
        slo: slo
    },
    SELECT: {
        smaugize: selectSmaugize,
        format: selectFormat
    },
    exceptions: {
        byType: {
            SELECT: ['state', 'city']
        }
    }
};

function select(filter, options) {
    var values = filter.get('value');

    if (values && values.length) {
        _.map(values, function each(value) {
            if (value.id && typeof value.id === 'string' && value.id.match(selectReplaces.regexpFind)) {
                value.id = value.id.replace(selectReplaces.regexpFind, function replace(c) {
                    return selectReplaces.characters[c];
                });
            }
            return value;
        });
        filter.set({
            value: values
        }, {
            unset: false
        });
    }
    return filter;
}

function buildKilometerRange(to, label, dictionary) {
    return {
        from: 0,
        to: to,
        label: [dictionary['misc.LessThan'], label, dictionary['posting_optionallist.Kms']].join('')
    };
}

function sortFilterLocations(locations, options, count) {
    var platform = options.app.session.get('platform');
    var hiddenLocations;

    if (platform !== 'desktop' || !locations || !locations.length || locations.length <= count) {
        return locations;
    }
    hiddenLocations = locations.slice(count).sort(function sortByName(location1, location2) {
        if (location1.value > location2.value) {
            return 1;
        }
        if (location1.value < location2.value) {
            return -1;
        }
        return 0;
    });
    return locations.slice(0, count).concat(hiddenLocations);
}

function city(filter, options) {
    filter.set({
        value: sortFilterLocations(filter.get('value'), options, 12)
    }, {
        unset: false
    });
    return filter;
}

function state(filter, options) {
    filter.set({
        value: sortFilterLocations(filter.get('value'), options, 12)
    }, {
        unset: false
    });
    return filter;
}

function neighborhood(filter, options) {
    filter.set({
        value: sortFilterLocations(filter.get('value'), options, 8)
    }, {
        unset: false
    });
    return filter;
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

function flo(filter, options) {
    filter = checkSelectValue(filter, options);
    filter = checkDescription(filter, options, '');
    return filter;
}

function slo(filter, options) {
    if (!this.has('flo') || !this.get('flo').has('current')) {
        return;
    }
    if (this.get('flo').get('current').length > 1) {
        return;
    }
    filter = checkSelectValue(filter, options);
    filter = checkDescription(filter, options, '');
    return filter;
}

function age(filter, options) {
    var dictionary = translations.get(options.app.session.get('selectedLanguage'));

    filter = checkDescription(filter, options, 'misc.Age');
    filter.set('value', [{
            id: 'from',
            value: '18',
            count: 0
        }, {
            id: 'to',
            value: dictionary['misc.Max'],
            count: 0
        }], {
            unset: false
        });
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
        filter.set('description', dictionary[key] || '', {
            unset: false
        });
    }
    return filter;
}

function selectSmaugize(values) {
    return selectReplace(values, /\+|\*/g, _.invert(selectReplaces.characters));
}

function selectFormat(values) {
    return selectReplace(values, /_|-/g, selectReplaces.characters);
}

function selectReplace(values, regexp, characters) {
    if (values && values.length) {
        values = _.map(values, function each(value) {
            if (typeof value === 'string' && value.match(regexp)) {
                value = value.replace(regexp, function replace(c) {
                    return characters[c] || c;
                });
            }
            return value;
        });
    }
    return values;
}
