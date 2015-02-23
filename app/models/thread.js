'use strict';

var Base = require('../bases/model');
var Paginator = require('../modules/paginator');
var helpers = require('../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    url: '/conversations/:threadId/messages',
    paginate: function (url, query, options) {
        var page = options.page;
        var total;

        this.paginator = new Paginator({
            url: url,
            page: query.page,
            pageSize: query.pageSize,
            total: this.get('count') ? this.get('count') : 0
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
    },
    parse: function (message, options) {
        _.each(message.messages, function each(message) {
            if (message.date) {
                message.date = new Date(message.date * 1000);
                message.date = {
                    year: message.date.getFullYear(),
                    month: message.date.getMonth() + 1,
                    day: message.date.getDate(),
                    hour: message.date.getHours(),
                    minute: message.date.getMinutes(),
                    second: message.date.getSeconds()
                };
                message.date.since = helpers.timeAgo(message.date);
            }
        });

        return Base.prototype.parse.apply(this, arguments);
    }
});

module.exports.id = 'Thread';
