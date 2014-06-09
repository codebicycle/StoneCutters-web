'use strict';

var config = require('../config');
var _ = require('underscore');

module.exports = (function() {

    function findFilters(filters) {
        var match = filters.match(/-[a-zA-Z0-9]+_[a-zA-Z0-9_\.]*/g);

        return(match ? match : []);
    }

    function parseValueFilter(value, filter) {
        if (!~value.indexOf('_')) {
            filter.type = _.contains(['true', 'false'], value) ? 'BOOLEAN' : 'SELECT';
            return value;
        }
        value = value.split('_');
        filter.type = 'RANGE';
        return {
            from: value[0],
            to: value[1]
        };
    }

    function parseFilter(filter) {
        var keyValue = filter.replace(/-([a-zA-Z0-9]+)_([a-zA-Z0-9_\.]*)/g, '$1#$2');

        keyValue = keyValue.split('#');
        filter = {
            name: keyValue[0]
        };
        filter.value = parseValueFilter(keyValue[1], filter);
        return filter;
    }

    function prepareFilters(params) {
        var filters = {};
        var listFilters = findFilters(params.filters);

        _.each(listFilters, function parseFilters(filter, i) {
            filter = parseFilter(filter);
            filters[ filter.name ] = filter;
        });
        return filters;
    }

    function prepareURLFilters(params) {
        var url;
        var sort;
        var sortNameValue;
        var filters = params.filters;

        if (!filters || _.isEmpty(filters)) {
            return '';
        }
        url = ['/'];
        if (filters.sort) {
            sort = filters.sort;
            delete filters.sort;
        }
        _.each(filters, function(filter, name) {
            if (filter.value === 'false') {
                return;
            }
            url.push('-');
            url.push(name);
            url.push('_');
            switch(filter.type) {
                case 'SELECT':
                    url.push(filter.value);
                    params['f.' + name] = filter.value;
                    break;
                case 'BOOLEAN':
                    url.push(filter.value);
                    params['f.' + name] = filter.value;
                    break;
                case 'RANGE':
                    url.push(filter.value.from);
                    url.push('_');
                    url.push(filter.value.to);
                    params['f.' + name] = filter.value.from + 'TO' + filter.value.to;
                    break;
                default:
                    break;
            }
        });
        if (sort) {
            url.push('-sort_');
            url.push(sort.value);
            sortNameValue = sort.value.replace(/([a-zA-Z0-9_]*)(desc)/g, '$1#$2');
            sortNameValue = sortNameValue.split('#');
            params['s.' + sortNameValue[0]] = sortNameValue[1] || 'asc';
        }
        return url.join('');
    }

    function prepareURLParams(params, urlBase, offset) {
        var url = [];
        var page = params.page + offset;

        url.push(urlBase);
        if (page > 1) {
            url.push('-p-');
            url.push(page);
        }
        url.push(params.urlFilters || '');
        return url.join('');
    }

    function prepare(app, params) {
        var max = config.get(['smaug', app.getSession('platform'), 'maxPageSize'], 25);

        if (!params.pageSize || (params.pageSize < 1 || params.pageSize > max)) {
            params.pageSize = max;
        }
        params.item_type = 'adsList';
        params.location = app.getSession('siteLocation');
        params.page = (params.page && !isNaN(Number(params.page)) ? Number(params.page) : 1);
        app.persistSession({
            page: params.page
        });
        params.offset = (params.page - 1) * params.pageSize;
        if (params.search) {
            if (params.search === 'undefined' && !~app.getSession('path').indexOf('undefined')) {
                delete params.search;
            }
            params.searchTerm = params.search;
        }
        if (params.filters) {
            params.filters = prepareFilters(params);
            params.urlFilters = prepareURLFilters(params);
        }
    }

    function paginate(metadata, params, url) {
        var next;
        var max = params.pageSize;

        metadata.page = params.page;
        metadata.totalPages = Math.floor(metadata.total / max) + ((metadata.total % max) === 0 ? 0 : 1);
        metadata.current = prepareURLParams(params, url, 0);
        if (metadata.total > 0) {
            next = metadata.next;
            if (next) {
                metadata.next = prepareURLParams(params, url, 1);
            }
            if (params.page > 1) {
                metadata.previous = prepareURLParams(params, url, -1);
            }
        }
    }

    return {
        prepare: prepare,
        paginate: paginate
    };
})();