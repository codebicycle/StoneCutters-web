'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var parsers = require('../parsers');
var Paginator;
var Base;

Backbone.noConflict();
Base = Backbone.Model;

function initialize(attributes, options) {
    var page = this.get('page');
    var total = this.get('total');
    var pageSize = this.get('pageSize');
    var attrs = {
        totalPages: Math.floor(total / pageSize) + ((total % pageSize) === 0 ? 0 : 1),
        current: format.call(this, page)
    };

    this.options = _.clone(options);
    if (total > 0) {
        if (options.next) {
            attrs.next = format.call(this, page + 1);
            attrs.last = format.call(this, attrs.totalPages);
        }
        if (page > 1) {
            attrs.previous = format.call(this, page - 1);
            attrs.first = format.call(this, 1);
        }
    }
    this.set(attrs, {
        merge: true
    });
}

function format(page) {
    var url = this.get('url');

    _.each(parsers, function(parser) {
        if (~url.indexOf(parser.name)) {
            url = parser.parse(url, page, this.options || {});
        }
    }, this);
    return url;
}

function isFirst(page) {
    return (page || this.get('page')) === 1;
}

function isLast(page) {
    return (page || this.get('page')) === this.get('totalPages');
}

function isEnabled() {
    return this.has('next') || this.has('previous');
}

function preparePages(count) {
    var page = this.get('page');
    var totalPages = this.get('totalPages');
    var index = Math.floor(count / 2);
    var pages = [];
    var max;
    var i;
    var p;

    for (i = 0, p = index; i < count; i++, p--) {
        if (!p) {
            pages.splice(0, 0, page);
            continue;
        }
        pages.splice(0, 0, p + page);
    }

    if ((totalPages - page) < 2) {
        max = (totalPages - page);
        for (i = 0, max = (max === 0 ? index : max); i < max; i++) {
            pages.splice(0, 0, pages[0] - 1);
            pages.pop();
        }
    }
    return pages;
}

function pages(count) {
    var totalPages = this.get('totalPages');
    var currentPage = this.get('page');
    var pagesNumber = preparePages.call(this, count);
    var max = pagesNumber.length;
    var pagesArray = [];
    var size = 0;
    var page;
    var i;

    for (i = 0; i < pagesNumber.length && size < count; i++) {
        page = pagesNumber[i];

        if (page > 0 && page <= totalPages) {
            pagesArray.push({
                page: page,
                url: format.call(this, page),
                isCurrent: (page === currentPage)
            });
            size++;
        }
        else if (page < totalPages) {
            pagesNumber.push(pagesNumber[pagesNumber.length - 1] + 1);
        }
    }
    return pagesArray;
}

module.exports = Base.extend({
    initialize: initialize,
    isFirst: isFirst,
    isLast: isLast,
    isEnabled: isEnabled,
    pages: pages
});

module.exports.id = 'Paginator';
