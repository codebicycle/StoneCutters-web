'use strict';

var _ = require('underscore');
var utils = require('../../../shared/utils');
var config = require('./config');
var transformers = require('./transformers');

var regexpReplace = /-([a-zA-Z0-9]+)_([a-zA-Z0-9_\.]*)/g;
var regexpFind = /-[a-zA-Z0-9]+_[a-zA-Z0-9_\.]*/g;
var regexpSort = /([a-zA-Z0-9_]*)(desc)/g;
var booleans = ['true', 'false'];

function Filters(url, options) {
    this.url = url;
    this.options = (options || {});
    if (this.url) {
        this.parse(url);
    }
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
    var transformer;

    this.filters = {};
    _.each(listFilters, function parseFilters(filter, i) {
        filter = parseFilter(filter);
        transformer = transformers[filter.name];

        if (transformer) {
            filter = transformer.call(this, filter, this.options);
        }
        this.filters[ filter.name ] = filter;
    }, this);
    return this.filters;
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

_.extend(Filters.prototype, {
    parse: parse,
    smaugize: smaugize
});

module.exports = Filters;
