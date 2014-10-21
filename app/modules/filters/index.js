'use strict';

var _ = require('underscore');

module.exports = function filtersHelper() {
    var booleanValues = ['true', 'false'];

    function find(filters) {
        return (filters.match(/-[a-zA-Z0-9]+_[a-zA-Z0-9_\.]*/g) || []);
    }

    function parseValue(value, filter) {
        var pairs;

        if (!~value.indexOf('_') && _.contains(booleanValues, value)) {
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
        var keyValue = filter.replace(/-([a-zA-Z0-9]+)_([a-zA-Z0-9_\.]*)/g, '$1#$2');

        keyValue = keyValue.split('#');
        filter = {
            name: keyValue[0]
        };
        filter.value = parseValue(keyValue[1], filter);
        return filter;
    }

    function parse(url) {
        var filters = {};
        var listFilters = find(url);

        _.each(listFilters, function parseFilters(filter, i) {
            filter = parseFilter(filter);
            filters[ filter.name ] = filter;
        });
        return filters;
    }

    function addSelect(filters, filter) {
        var clone;

        if (filters[filter.name]) {
            return filters[filter.name].value.push(filter.value);
        }
        clone = _.clone(filter);
        clone.value = [clone.value];
        filters[filter.name] = clone;
    }

    function addRange(filters, filter) {
        var clone;

        if (filters[filter.name]) {
            filters[filter.name].value = filter.value;
            return filters[filter.name].value;
        }
        clone = _.clone(filter);
        filters[filter.name] = clone;
    }

    function addBoolean(filters, filter) {
        if (filters[filter.name]) {
            filters[filter.name].value = filter.value;
            return filters[filter.name].value;
        }
        filters[filter.name] = _.clone(filter);
    }

    function add(filters, filter) {
        var callback;

        if (filter.type === 'SELECT') {
            callback = addSelect;
        }
        else if (filter.type === 'RANGE') {
            callback = addRange;
        }
        else if (filter.type === 'BOOLEAN') {
            callback = addBoolean;
        }
        callback(filters, filter);
        return filters;
    }

    function removeSelect(filters, filter) {
        if (filters[filter.name]) {
            filters[filter.name].value = _.filter(filters[filter.name].value, function(value) {
                return value !== filter.value;
            });

            if (!filters[filter.name].value.length) {
                delete filters[filter.name];
            }
        }
    }

    function remove(filters, filter) {
        if (filter.type === 'SELECT') {
            removeSelect(filters, filter);
        }
        else if (filter.type === 'RANGE' || filter.type === 'BOOLEAN') {
            delete filters[filter.name];
        }
        return filters;
    }

    function prepareFilterUrl(filters) {
        var url = '';
        _.each(filters, function(filter, name) {
            url += '-' + name + '_' + filter.value.join('_');
        });
        return url;
    }

    return {
        parse: parse,
        add: add,
        remove: remove,
        prepareFilterUrl : prepareFilterUrl
    };
}();
