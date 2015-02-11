'use strict';

var Base = require('../bases/model');
var Paginator = require('../modules/paginator');
var helpers = require('../helpers');

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
    }
});

module.exports.id = 'Thread';
