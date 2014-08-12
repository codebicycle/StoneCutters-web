'use strict';

var _ = require('underscore');
var config = require('../../shared/config');
var common = require('./common');
var navigation = require('./navigation');

module.exports = (function() {
    var handlers = {
        categories: {
            list: function() {
                navigation.clear.call(this);
                return '/';
            },
            show: function() {
                var page = this.page || this.app.session.get('page') || 0;
                var state = {
                    name: 'item-listing'
                };
                var breadcrumb;
                var fragment;

                if (!page || page === 0) {
                    navigation.clear.call(this);
                    breadcrumb = '/';
                }
                else if (this.relatedAds) {
                    state.name = 'relateds';
                    state.item = this.relatedAds;
                    if (page === 1) {
                        fragment = navigation.getState.call(this);
                        if (fragment && fragment.name === 'item-show') {
                            breadcrumb = '/' + common.slugToUrl({
                                id: fragment.item
                            });
                        }
                        else {
                            breadcrumb = '/' + common.slugToUrl(this.category);
                        }
                    }
                    else {
                        breadcrumb = '/' + common.slugToUrl(this.subcategory);
                        if ((page - 1) > 1) {
                            breadcrumb += '-p-' + (page - 1);
                        }
                    }
                }
                else if (page === 1) {
                    breadcrumb = '/' + common.slugToUrl(this.category);
                }
                else {
                    breadcrumb = '/' + common.slugToUrl(this.subcategory);
                    if ((page - 1) > 1) {
                        breadcrumb += '-p-' + (page - 1);
                    }
                }
                saveNavigation(this, state);
                return breadcrumb;
            }
        },
        post: {
            categories: function() {
                navigation.clear.call(this);
                saveNavigation(this);
                return '/';
            },
            subcategories: function() {
                navigation.clear.call(this);
                saveNavigation(this);
                return '/posting';
            },
            form: function() {
                saveNavigation(this);
                return '/posting/' + this.category.id;
            },
            success: function() {
                saveNavigation(this);
                return '/posting/' + this.category.id + '/' + this.subcategory.id;
            }
        },
        items: {
            show: function() {
                var page = this.app.session.get('page') || 0;
                var breadcrumb = '/' + common.slugToUrl(this.item.category);
                var fragment = navigation.getState.call(this);
                var state = {
                    name: 'item-show',
                    item: this.item.id
                };

                if (fragment) {
                    switch (fragment.name) {
                        case 'search':
                            this.search = fragment.search;
                            this.page = fragment.page + 1;
                            breadcrumb = handlers.items.search.call(this);
                            navigation.popState.call(this);
                            break;
                        case 'item-listing':
                            breadcrumb = fragment.url;
                            break;
                        case 'relateds':
                            breadcrumb = fragment.url + '?relatedAds=' + fragment.item;
                            navigation.popState.call(this);
                            break;
                        case 'myads':
                            breadcrumb = '/myolx/myadslisting';
                            break;
                        case 'favorites':
                            breadcrumb = '/myolx/favoritelisting';
                            break;
                    }
                }
                else {
                    if (page > 1) {
                        breadcrumb += '-p-' + page;
                    }
                }
                saveNavigation(this, state);
                return breadcrumb;
            },
            gallery: function() {
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
                return '/' + common.slugToUrl(this.item);
            },
            search: function() {
                var page = this.page || this.app.session.get('page') || 0;
                var state = {
                    name: 'search',
                    search: this.search,
                    page: page
                };
                var breadcrumb;

                if (page === 1) {
                    navigation.clear.call(this);
                    saveNavigation(this, state);
                    return '/';
                }
                saveNavigation(this, state);
                breadcrumb = '/nf/search/' + this.search;
                if ((page - 1) > 1) {
                    breadcrumb += '/-p-' + (page - 1);
                }
                return breadcrumb;
            }
        },
        users: {
            myolx: function() {
                navigation.clear.call(this);
                return '/';
            },
            myads: function() {
                var platform = this.app.session.get('platform');
                var breadcrumb;

                if (platform === 'wap' || platform === 'html4') {
                    breadcrumb = '/myolx';
                } 
                else {
                    navigation.clear.call(this);
                    breadcrumb = '/';
                }
                saveNavigation(this, {
                    name: 'myads'
                });
                return breadcrumb;
            },
            favorites: function() {
                var platform = this.app.session.get('platform');
                var breadcrumb;

                if (platform === 'wap' || platform === 'html4') {
                    breadcrumb = '/myolx';
                } 
                else {
                    navigation.clear.call(this);
                    breadcrumb = '/';
                }
                saveNavigation(this, {
                    name: 'favorites'
                });
                return breadcrumb;
            }
        }
    };

    function prepareNavigation(data) {
        var url = data.app.session.get('path');
        var fragment = navigation.getState.call(data);

        if (fragment && fragment.url === url) {
            navigation.popState.call(data);
            return;
        }
        fragment = navigation.getPrevious.call(data);
        if (fragment && fragment.url === url) {
            if (!data.relatedAds) {
                navigation.popState.call(data);
                navigation.popState.call(data);
            }
            return;
        }
    }

    function saveNavigation(data, state) {
        var url = data.app.session.get('path');
        var fragment = navigation.getState.call(data);

        if (fragment && (fragment.url === url || (state && fragment.name === state.name))) {
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
