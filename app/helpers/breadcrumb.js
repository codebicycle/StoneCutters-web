'use strict';

var config = require('../config');
var common = require('./common');
var navigation = require('./navigation');
var _ = require('underscore');

module.exports = (function() {
    var handlers = {
        home: {
            index: function() {
                navigation.clear.call(this);
                return '/';
            }
        },
        categories: {
            show: function() {
                var page = this.app.session.get('page') || 0;
                var breadcrumb;

                saveNavigation(this);
                if (!page || page === 0) {
                    return '/';
                }
                if (page === 1) {
                    return '/' + common.slugToUrl(this.category);
                }
                breadcrumb = '/' + common.slugToUrl(this.subCategory);
                if ((page - 1) > 1) {
                    breadcrumb += '-p-' + (page - 1);
                }
                return breadcrumb;
            }
        },
        post: {
            index: function() {
                saveNavigation(this);
                return '/';
            },
            subcat: function() {
                saveNavigation(this);
                return '/posting';
            },
            form: function() {
                saveNavigation(this);
                return '/posting/' + this.category.id;
            },
            success: function() {
                saveNavigation(this);
                return '/posting/' + this.category.parentId + '/' + this.category.id;
            }
        },
        items: {
            show: function() {
                var page = this.app.session.get('page') || 0;
                var breadcrumb = '/' + common.slugToUrl(this.item.category);
                var fragment = navigation.getState.call(this);

                if (fragment && fragment.n === 'search') {
                    this.search = fragment.q;
                    this.page = fragment.p + 1;
                    breadcrumb = handlers.items.search.call(this);
                    navigation.popState.call(this);
                }
                else {
                    if (page > 1) {
                        breadcrumb += '-p-' + page;
                    }
                }
                saveNavigation(this);
                return breadcrumb;
            },
            galery: function() {
                var url = '/' + common.slugToUrl(this.item);

                if (this.pos) {
                    url += '?pos=' + this.pos;
                }
                saveNavigation(this);
                return url;
            },
            reply: function() {
                saveNavigation(this);
                return '/' + common.slugToUrl(this.item);
            },
            success: function() {
                saveNavigation(this);
                return '/' + common.slugToUrl(this.item);
            },
            search: function() {
                var page = this.page || this.app.session.get('page') || 0;
                var breadcrumb;

                saveNavigation(this, {
                    n: 'search',
                    q: this.search,
                    p: page
                });

                if (page === 1) {
                    navigation.clear.call(this);
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
                var platform = this.app.session.get('platform');

                if (platform === 'wap' || platform === 'html4') {
                    saveNavigation(this);
                    return '/myolx';
                }
            },
            favorites: function() {
                var platform = this.app.session.get('platform');

                if (platform === 'wap' || platform === 'html4') {
                    saveNavigation(this);
                    return '/myolx';
                }
            }
        }
    };

    function prepareUrl(url) {
        var parts = url.split('?');
        
        return parts.shift();
    }

    function prepareNavigation(data) {
        var url = data.app.session.get('url');
        var fragment = navigation.getState.call(data);

        url = prepareUrl(url);
        console.log('Last [', (fragment ? fragment.url : undefined), '][', url, ']');
        if (fragment && fragment.url === url) {
            navigation.popState.call(data);
            return;
        }

        fragment = navigation.getPrevious.call(data);
        console.log('Previous [', (fragment ? fragment.url : undefined), '][', url, ']');
        if (fragment && fragment.url === url) {
            navigation.popState.call(data);
            navigation.popState.call(data);
            return;
        }
    }

    function saveNavigation(data, state) {
        var url = data.app.session.get('url');
        var fragment = navigation.getState.call(data);

        url = prepareUrl(url);
        if (fragment && (fragment.url === url || (state && fragment.n === state.n))) {
            navigation.popState.call(data);
        }
        navigation.pushState.call(data, url, state);
    }

    function get(data) {
        var currentRoute = data.app.session.get('currentRoute');
        var referer = data.app.session.get('referer');
        var breadcrumb;
        var controller;
        
        prepareNavigation(data);
        if (currentRoute.controller !== this.name.split('/').shift()) {
            return data.app.session.get('breadcrumb');
        }
        controller = handlers[currentRoute.controller];
        if (controller && controller[currentRoute.action]) {
            breadcrumb = controller[currentRoute.action].call(data);
        }
        breadcrumb = breadcrumb || referer || '/';
        data.app.session.update({
            breadcrumb: breadcrumb,
            referer: referer
        });
        return breadcrumb;
    }

    return {
        get: get
    };
})();
