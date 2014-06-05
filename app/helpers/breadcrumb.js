'use strict';

var config = require('../config');
var common = require('./common');
var _ = require('underscore');

module.exports = (function() {
    var handlers = {
        categories: {
            show: function() {
                var page = this.app.getSession('page') || 0;
                var categoryId;
                var category;
                var breadcrumb;

                if (page === 0) {
                    return '/';
                }
                if (page === 1) {
                    categoryId = this.category.parentId;
                    category = this.app.getSession('categories')._byId[categoryId];
                    return '/' + common.slugToUrl(category);
                }
                categoryId = this.category.id;
                category = this.app.getSession('childCategories')[categoryId];
                breadcrumb = '/' + common.slugToUrl(category);
                if ((page - 1) > 1) {
                    breadcrumb += '-p-' + (page - 1);
                }
                return breadcrumb;
            }
        },
        post: {
            form: function() {
                return '/';
            },
            success: function() {
                return '/posting/' + this.category.parentId + '/' + this.category.id;
            }
        },
        items: {
            show: function() {
                var page = this.app.getSession('page') || 0;
                var categoryId = this.item.category.id;
                var category = this.app.getSession('childCategories')[categoryId];
                var breadcrumb = '/' + common.slugToUrl(category);

                if (page > 1) {
                    breadcrumb += '-p-' + page;
                }
                return breadcrumb;
            },
            galery: function() {
                var url = '/' + common.slugToUrl(this.item);

                if (this.pos) {
                    url += '?pos=' + this.pos;
                }
                return url;
            },
            reply: function() {
                return '/' + common.slugToUrl(this.item);
            },
            success: function() {
                return '/' + common.slugToUrl(this.item);
            },
            search: function() {
                var page = this.app.getSession('page') || 0;
                var breadcrumb;

                if (page === 1) {
                    return '/';
                }
                breadcrumb = '/nf/search/' + this.search;
                if ((page - 1) > 1) {
                    breadcrumb += '/-p-' + (page - 1);
                }
                return breadcrumb;
            }
        },
        user: {
            'my-ads': function() {
                var platform = this.app.getSession('platform');

                if (platform === 'wap' || platform === 'html4') {
                    return '/myolx';
                }
            },
            favorites: function() {
                var platform = this.app.getSession('platform');

                if (platform === 'wap' || platform === 'html4') {
                    return '/myolx';
                }
            }
        }
    };

    function get(data) {
        var currentRoute = data.app.getSession('currentRoute');
        var referer = data.app.getSession('referer');
        var breadcrumb;
        var controller;

        if (currentRoute.controller !== this.name.split('/').shift()) {
            return data.app.getSession('breadcrumb');
        }
        controller = handlers[currentRoute.controller];
        if (controller && controller[currentRoute.action]) {
            breadcrumb = controller[currentRoute.action].call(data);
        }
        breadcrumb = breadcrumb || referer || '/';
        data.app.updateSession({
            breadcrumb: breadcrumb,
            referer: referer
        });
        return breadcrumb;
    }

    return {
        get: get
    };
})();
