'use strict';

var _ = require('underscore');
var config = require('../../../shared/config');
var Paginator = require('./models/paginator');

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

_.extend(Paginator, {
    prepare: prepare
});

module.exports = Paginator;
