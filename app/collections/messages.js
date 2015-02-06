'use strict';

var Base = require('../bases/collection');
var _ = require('underscore');
var Message = require('../models/message');
var Paginator = require('../modules/paginator');
var helpers = require('../helpers');

module.exports = Base.extend({
    model: Message,
    url: '/users/:userId/messages',
    parse: function(response) {
        if (response) {
            this.metadata = response.metadata;
            return response.data;
        }
        console.log('[OLX_DEBUG] Empty messages response');
        this.metadata = {};
        return [];
    },
    paginate: function (url, query, options) {
        var page = options.page;
        var total;

        this.paginator = new Paginator({
            url: url,
            page: query.page,
            pageSize: query.pageSize,
            total: this.metadata ? this.metadata.total : 0
        }, {
            gallery: options.gallery,
            filters: this.filters
        });
        if (page !== undefined) {
            if (isNaN(page) || page <= 1) {
                return 1;
            }
            total = this.paginator.get('totalPages');
            if (page > total) {
                return total;
            }
        }
    }
});

module.exports.id = 'Messages';
