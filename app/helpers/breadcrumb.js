'use strict';

var config = require('../config');
var common = require('./common');
var _ = require('underscore');

module.exports = (function() {
    var handlers = {
        categories: function bcCategories(route, breadcrumb) {
            var page = this.app.getSession('page') || 0;
            var categoryId;
            var category;

            if (route.action === 'show') {
                if (page === 0) {
                    breadcrumb = '/';
                }
                else if (page === 1) {
                    categoryId = this.category.parentId;
                    category = this.app.getSession('categories')._byId[categoryId];
                    breadcrumb = '/' + common.slugToUrl(category);
                }
                else {
                    categoryId = this.category.id;
                    category = this.app.getSession('childCategories')[categoryId];
                    breadcrumb = '/' + common.slugToUrl(category);
                    if ((page - 1) > 1) {
                        breadcrumb += '-p-' + (page - 1);
                    }
                }
            }
            return breadcrumb;
        },
        post: function bcPost(route, breadcrumb) {
            if (route.action === 'form') {
                breadcrumb = '/';
            }
            return breadcrumb;
        },
        items: function bcItems(route, breadcrumb) {
            var page = this.app.getSession('page') || 0;
            var categoryId;
            var category;

            if (route.action === 'show') {
                categoryId = this.item.category.id;
                category = this.app.getSession('childCategories')[categoryId];
                breadcrumb = '/' + common.slugToUrl(category);
                if (page > 1) {
                    breadcrumb += '-p-' + page;
                }
            }
            else if (route.action === 'reply') {
                breadcrumb = '/' + common.slugToUrl(this.item);
            }
            else if (route.action === 'search') {
                if (page === 1) {
                    breadcrumb = '/';
                }
                else {
                    breadcrumb = '/nf/search/' + this.search;
                    if ((page - 1) > 1) {
                        breadcrumb += '/-p-' + (page - 1);
                    }
                }
            }
            return breadcrumb;
        }
    };

    function get(data) {
        var currentRoute = data.app.getSession('currentRoute');
        var breadcrumb = data.app.getSession('breadcrumb');
        var referer = data.app.getSession('referer');
        var handler;

        if (currentRoute.controller !== this.name.split('/').shift()) {
            return breadcrumb;
        }
        handler = handlers[currentRoute.controller];
        if (handler) {
            breadcrumb = handler.call(data, currentRoute, breadcrumb);
        }
        breadcrumb = breadcrumb || referer || '/';
        data.app.updateSession({
            breadcrumb: breadcrumb
        });
        return breadcrumb;
    }

    return {
        get: get
    };
})();