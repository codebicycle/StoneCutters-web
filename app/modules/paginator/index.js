'use strict';

var _ = require('underscore');
var config = require('../../../shared/config');

var urlParsers = {
    page: {
        name: '[page]',
        parse: function (url, options) {
            if (options.page > 1) {
                url = url.replace(this.name, '-p-' + options.page);
            }
            return url.replace(this.name, '');
        }
    },
    gallery: {
        name: '[gallery]',
        parse: function (url, options) {
            return url.replace(this.name, options.gallery || '');
        }
    },
    filters: {
        name: '[filters]',
        parse: function (url, options) {
            if (options.filters) {
                url = url.replace(this.name, '/' + options.filters.format());
            }
            return url.replace(this.name, '');
        }
    }
};

function format(url, options) {
    _.each(urlParsers, function(parser) {
        if (~url.indexOf(parser.name)) {
            url = parser.parse(url, options);
        }
    });
    return url;
}

function prepare(app, params, type) {
    var platform = app.session.get('platform');
    var location = app.session.get('location').url;
    var max = config.get(['smaug', platform, 'maxPageSize']) || config.getForMarket(location, ['ads', 'quantity', type || 'listing'], 25);
    
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
}

function paginate(metadata, params, url, options) {
    var page = params.page;
    var next;

    metadata.page = options.page = page;
    metadata.totalPages = Math.floor(metadata.total / params.pageSize) + ((metadata.total % params.pageSize) === 0 ? 0 : 1);
    metadata.current = format(url, options);

    if (metadata.total > 0) {
        next = metadata.next;
        if (next) {
            options.page = page + 1;
            metadata.next = format(url, options);
        }

        if (page > 1) {
            options.page = page - 1;
            metadata.previous = format(url, options);
        }
    }
}

module.exports = {
    prepare: prepare,
    paginate: paginate
};
