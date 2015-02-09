'use strict';

var _ = require('underscore');
var Base = require('../bases/collection');
var Conversation = require('../models/conversation');
var Items = require('./items');
var Paginator = require('../modules/paginator');
var helpers = require('../helpers');

module.exports = Base.extend({
    model: Conversation,
    url: '/conversations',
    parse: function(response) {
        this.meta = _.omit(response, 'conversations', 'items');
        this.items = new Items(response.items, {
            app: this.app
        });
        return response.conversations;
    },
    paginate: function (url, query, options) {
        var page = options.page;
        var total;

        this.paginator = new Paginator({
            url: url,
            page: query.page,
            pageSize: query.pageSize,
            total: this.meta ? this.meta.count : 0
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

module.exports.id = 'Conversations';
