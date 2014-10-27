'use strict';

var _ = require('underscore');

var regexpReplace = /-([a-zA-Z0-9]+)_([a-zA-Z0-9_\.]*)/g;
var regexpFind = /-[a-zA-Z0-9]+_[a-zA-Z0-9_\.]*/g;
var regexpSort = /([a-zA-Z0-9_]*)(desc)/g;
var booleans = ['true', 'false'];
var FILTERS = {
    'f.location_state': 'SELECT',
    'f.location_city': 'SELECT',
    neighborhood: 'SELECT',
    nbhzone: 'SELECT',
    directdistancedialing: 'SELECT',
    category: 'SELECT',
    parentCategory: 'SELECT',
    carbrand: 'SELECT',
    optionals: 'SELECT',
    carmodel: 'SELECT',
    furnished: 'SELECT',
    sellertype: 'SELECT',
    seller: 'SELECT',
    imageGallery: 'SELECT',
    ethnicgroup: 'SELECT',
    bodytype: 'SELECT',
    bedrooms: 'SELECT',
    kilometers: 'RANGE',
    year: 'RANGE',
    excludecity: 'SELECT',
    search: 'SELECT',
    brokerFree: 'SELECT',
    petsAllowed: 'SELECT',
    carType: 'SELECT',
    keywords: 'SELECT',
    hasimage: 'BOOLEAN',
    jobStatus: 'SELECT',
    age: 'RANGE',
    bathrooms: 'RANGE',
    latitude: 'RANGE',
    longitude: 'RANGE',
    'f.itemLat': 'RANGE',
    'f.itemLong': 'RANGE',
    pricerange: 'RANGE',
    surface: 'RANGE',
    featured: 'SELECT',
    adtype: 'SELECT',
    distance: 'SELECT',
    condition: 'SELECT'
};

function Filters(url) {
    this.url = url;
    this.parse(url);
}

function has(name, value) {
    var filter = this.filters[name];
    var exists = !!filter;

    if (exists && !_.isUndefined(value)) {
        if (filter.type === 'SELECT') {
            return _.contains(filter.value, value);
        }
        exists = (filter.value === value);
    }
    return exists;
}

function get(name) {
    return this.filters[name];
}

function setSelect(filter) {
    if (this.filters[filter.name]) {
        return this.filters[filter.name].value.push(filter.value);
    }
    filter = _.clone(filter);
    filter.value = [filter.value];
    this.filters[filter.name] = filter;
}

function set(filter) {
    if (filter.type === 'SELECT') {
        if (this.has(filter.name, filter.value)) {
            return this.remove(filter);
        }
        setSelect.call(this, filter);
    }
    else {
        this.filters[filter.name] = _.clone(filter);
    }
    return this;
}

function removeSelect(filter) {
    if (this.filters[filter.name]) {
        this.filters[filter.name].value = _.filter(this.filters[filter.name].value, function(value) {
            return value !== filter.value;
        });

        if (!this.filters[filter.name].value.length) {
            delete this.filters[filter.name];
        }
    }
}

function remove(filter) {
    if (filter.type === 'SELECT') {
        removeSelect.call(this, filter);
    }
    else if (filter.type === 'RANGE' || filter.type === 'BOOLEAN') {
        delete this.filters[filter.name];
    }
    return this.filters;
}

function find(url) {
    return (url.match(regexpFind) || []);
}

function parseValue(value, filter) {
    var pairs;

    if (!~value.indexOf('_') && _.contains(booleans, value)) {
        filter.type =  'BOOLEAN';
        return value;
    }
    pairs = value.split('_');
    if (value.slice(0, 1) === '_' || value.slice(value.length - 1, value.length) === '_' || pairs[0].match(/[0-9]+/)) {
        filter.type = 'RANGE';
        return {
            from: pairs[0],
            to: pairs[1]
        };
    }
    filter.type = 'SELECT';
    return pairs;
}

function parseFilter(filter) {
    var keyValue = filter.replace(regexpReplace, '$1#$2');

    keyValue = keyValue.split('#');
    filter = {
        name: keyValue[0]
    };
    filter.value = parseValue(keyValue[1], filter);
    return filter;
}

function parse(url) {
    var listFilters = find(url);

    this.filters = {};
    _.each(listFilters, function parseFilters(filter, i) {
        filter = parseFilter(filter);
        this.filters[ filter.name ] = filter;
    }, this);
    return this.filters;
}

function format() {
    var _filters = this.sort();
    var url = [];

    _.each(_filters, function(filter) {
        url.push('-');
        url.push(filter.name);
        url.push('_');
        if (filter.type === 'RANGE') {
            url.push(filter.value.from);
            url.push('_');
            return url.push(filter.value.to);
        }
        if (filter.type === 'SELECT') {
            return url.push(filter.value.join('_'));
        }
        url.push(filter.value);
    });
    return url.join('');
}

function _sort(order, filters) {
    return (order || Object.keys(FILTERS)).filter(function each(filter) {
        return _.contains(Object.keys(filters), filter);
    }).map(function each(filter) {
        return filters[filter];
    });
}

function sort(order) {
    return _sort(order, this.filters);
}

function smaugize() {
    var filters = _.clone(this.filters);
    var params = {};
    var filterName;
    var sort;

    if (_.isEmpty(filters)) {
        return params;
    }
    _.each(filters, function(filter, name) {
        if (filter.value === 'false' || name === 'sort') {
            return;
        }

        filterName = 'f.' + name;
        switch (filter.type) {
            case 'SELECT':
                params[filterName] = filter.value.join('OR');
                break;
            case 'RANGE':
                params[filterName] = [filter.value.from, 'TO', filter.value.to].join('');
                break;
            case 'BOOLEAN':
                params[filterName] = filter.value;
                break;
        }
    });
    if (filters.sort) {
        sort = filters.sort.value.replace(regexpSort, '$1#$2').split('#');
        params['s.' + sort[0]] = sort[1] || 'asc';
    }
    return params;
}

function prepare(arrayFilters) {
    var filters = {};

    _.each(arrayFilters, function each(filter) {
        filters[filter.name] = filter;
    });
    return filters;
}

_.extend(Filters.prototype, {
    has: has,
    get: get,
    set: set,
    remove: remove,
    sort: sort,
    parse: parse,
    format: format,
    smaugize: smaugize
});

_.extend(Filters, {
    sort: _sort,
    prepare: prepare
});

module.exports = Filters;
