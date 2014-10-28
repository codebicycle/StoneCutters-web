'use strict';

var _ = require('underscore');
var config = require('../../shared/config');
var Filters = require('../modules/filters');

module.exports = (function() {

    function format(params, urlBase, offset, isGallery) {
        var url = [];
        var page = params.page + offset;

        url.push(urlBase);
        if (page > 1) {
            url.push('-p-');
            url.push(page);
        }
        if (isGallery) {
            url.push(isGallery);
        }
        url.push(params.urlFilters || '');
        return url.join('');
    }

    function prepare(app, params, type) {
        var platform = app.session.get('platform');
        var location = app.session.get('location').url;
        var max = config.get(['smaug', platform, 'maxPageSize']) || config.getForMarket(location, ['ads', 'quantity', type || 'listing'], 25);
        var filters;

        if (!params.pageSize || (params.pageSize < 1 || params.pageSize > max)) {
            params.pageSize = max;
        }
        params.item_type = 'adsList';
        params.location = app.session.get('siteLocation');
        params.page = (params.page && !isNaN(Number(params.page)) ? Number(params.page) : 1);
        app.session.persist({
            page: params.page
        });
        params.offset = (params.page - 1) * params.pageSize;
        if (params.search) {
            if (params.search === 'undefined' && !~app.session.get('path').indexOf('undefined')) {
                delete params.search;
            }
            params.searchTerm = params.search;
        }
        if (params.filters) {
            filters = new Filters(params.filters);
            params.urlFilters = '/' + filters.format();
            _.extend(params, filters.smaugize());
        }
    }

    function paginate(metadata, params, url, isGallery) {
        var next;
        var max = params.pageSize;

        metadata.page = params.page;
        metadata.totalPages = Math.floor(metadata.total / max) + ((metadata.total % max) === 0 ? 0 : 1);
        metadata.current = format(params, url, 0, isGallery);
        if (metadata.total > 0) {
            next = metadata.next;
            if (next) {
                metadata.next = format(params, url, 1, isGallery);
            }
            if (params.page > 1) {
                metadata.previous = format(params, url, -1, isGallery);
            }
        }
    }

    return {
        prepare: prepare,
        paginate: paginate
    };
})();
