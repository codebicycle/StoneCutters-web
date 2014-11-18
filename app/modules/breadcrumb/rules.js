'use strict';

var helpers = require('../../helpers');
var navigation = require('./navigation');
var rules = {
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
                        breadcrumb = '/' + helpers.common.slugToUrl({
                            id: fragment.item
                        });
                    }
                    else {
                        breadcrumb = '/' + helpers.common.slugToUrl(this.category);
                    }
                }
                else {
                    breadcrumb = '/' + helpers.common.slugToUrl(this.subcategory);
                    if ((page - 1) > 1) {
                        breadcrumb += '-p-' + (page - 1);
                    }
                }
            }
            else if (page === 1) {
                breadcrumb = '/' + helpers.common.slugToUrl(this.category);
            }
            else {
                breadcrumb = '/' + helpers.common.slugToUrl(this.subcategory);
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
            var breadcrumb = '/' + helpers.common.slugToUrl(this.item.category);
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
                        breadcrumb = rules.items.search.call(this);
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
            var url = '/' + helpers.common.slugToUrl(this.item);

            if (this.pos) {
                url += '?pos=' + this.pos;
            }
            saveNavigation(this);
            return url;
        },
        reply: function() {
            saveNavigation(this);
            return '/' + helpers.common.slugToUrl(this.item);
        },
        success: function() {
            return '/' + helpers.common.slugToUrl(this.item);
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
        login: function() {
            var fragment = navigation.getState.call(this);

            if (fragment && fragment.url) {
                return fragment.url;
            }
            else {
                navigation.clear.call(this);
                return '/';
            }
        },
        register: function() {
            var fragment = navigation.getState.call(this);

            if (fragment && fragment.url) {
                return fragment.url;
            }
            else {
                return '/login';
            }
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

function saveNavigation(data, state) {
    var url = data.app.session.get('path');
    var fragment = navigation.getState.call(data);

    if (fragment && (fragment.url === url || (state && fragment.name === state.name))) {
        navigation.popState.call(data);
    }
    navigation.pushState.call(data, url, state);
}

module.exports = rules;
