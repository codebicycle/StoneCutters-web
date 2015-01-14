'use strict';

var _ = require('underscore');
var helpers = require('../helpers');
var middlewares = require('../middlewares');
var utils = require('../../shared/utils');
var phpRedirections = {
    index: '',
    posting: 'posting',
    register: 'register',
    login: 'login',
    switch_domain: '',
    myolx: 'myolx/myadslisting',
    yourads: 'myolx/myadslisting'
};
var phpPaths = Object.keys(phpRedirections);

if (typeof window === 'undefined') {
    var statsdModule = '../../server/modules/statsd';
    var statsd = require(statsdModule)();
}

module.exports = {
    category: function(params, callback) {
        helpers.common.redirect.call(this, '/des-cat-' + params.categoryId);
    },
    subcategory: function(params, callback) {
        helpers.common.redirect.call(this, '/des-cat-' + params.categoryId + '-p-' + params.page);
    },
    categoryExpired: function(params, callback) {
        helpers.common.redirect.call(this, params.title + '-cat-' + params.categoryId);
    },
    subcategoryList: function(params, callback) {
        helpers.common.redirect.call(this, '/des-cat-' + params.categoryId);
    },
    subcategoryListWithParams: function(params, callback) {
        helpers.common.redirect.call(this, '/des-cat-' + params.categoryId + '-p-' + params.page);
    },
    related: function(params, callback) {
        helpers.common.redirect.call(this, '/des-cat-' + params.categoryId + '-p-' + params.page);
    },
    gallery: function(params, callback) {
        helpers.common.redirect.call(this, '/des-iid-' + params.itemId + '/gallery');
    },
    itemGallery: function(params, callback) {
        helpers.common.redirect.call(this, '/des-iid-' + params.itemId + '/gallery');
    },
    item: function(params, callback) {
        helpers.common.redirect.call(this, '/des-iid-' + params.itemId);
    },
    itemShow: function(params, callback) {
        helpers.common.redirect.call(this, '/des-iid-' + params.itemId);
    },
    comment: function(params, callback) {
        helpers.common.redirect.call(this, '/des-iid-' + params.itemId);
    },
    itemComment: function(params, callback) {
        helpers.common.redirect.call(this, '/des-iid-' + params.itemId);
    },
    reply: function(params, callback) {
        helpers.common.redirect.call(this, '/iid-' + params.itemId + '/reply');
    },
    search: function(params, callback) {
        helpers.common.redirect.call(this, '/nf/search/' + (params.search || '') + '/-p-' + params.page);
    },
    popularSearches: function(params, callback) {
        helpers.common.redirect.call(this, '/');
    },
    nfsearch: function(params, callback) {
        helpers.common.redirect.call(this, '/nf/search/' + (params.search || '') + '/-p-' + params.page);
    },
    nfallresults: function(params, callback) {
        helpers.common.redirect.call(this, '/nf/all-results/-p-' + params.page);
    },
    login: function(params, callback) {
        helpers.common.redirect.call(this, '/login');
    },
    register: function(params, callback) {
        helpers.common.redirect.call(this, '/register');
    },
    location: function(params, callback) {
        helpers.common.redirect.call(this, '/location' + (params && params.posting ? '?target=posting' : ''));
    },
    postCategory: function(params, callback) {
        helpers.common.redirect.call(this, '/posting');
    },
    postSubcategory: function(params, callback) {
        helpers.common.redirect.call(this, '/posting/' + params.categoryId);
    },
    post: function(params, callback) {
        this.app.fetch({
            categories: {
                collection: 'Categories',
                params: {
                    location: this.app.session.get('siteLocation'),
                    languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id,
                    seo: this.app.seo.isEnabled()
                }
            }
        }, {
            readFromCache: false,
            store: true
        }, function afterFetch(err, result) {
            if (err) {
                return helpers.common.redirect.call(this, '/posting');
            }
            var category = result.categories.search(params.categoryId);

            if (!category) {
                return helpers.common.redirect.call(this, '/posting');
            }
            if (!category.get('parentId')) {
                return helpers.common.redirect.call(this, '/posting/' + params.categoryId);
            }
            helpers.common.redirect.call(this, '/posting/' + category.get('parentId') + '/' + params.categoryId);
        }.bind(this));
    },
    myolx: function(params, callback) {
        helpers.common.redirect.call(this, '/myolx');
    },
    myads: function(params, callback) {
        helpers.common.redirect.call(this, '/myolx/myadslisting');
    },
    favorites: function(params, callback) {
        helpers.common.redirect.call(this, '/myolx/favoritelisting');
    },
    edit: function(params, callback) {
        helpers.common.redirect.call(this, '/myolx/edititem/' + params.itemId);
    },
    redirecttomain: function(params, callback) {
        var siteLocation = this.app.session.get('siteLocation');
        var location = this.app.session.get('location').url;

        this.app.session.persist({
            olx_mobile_full_site_redirect: true,
            siteLocation: location
        }, {
            maxAge: 2 * utils.HOUR
        });
        helpers.common.redirect.call(this, 'http://' + siteLocation, null, {
            status: 302,
            pushState: false
        });
    },
    editphp: middlewares(function editphp(params, callback) {
        var url;

        if (params.editid) {
            url = utils.removeParams(this.app.session.get('url'), 'editid');
            return helpers.common.redirect.call(this, url.replace('.php', ('/' + params.editid)));
        }
        helpers.common.redirect.call(this, '/');
    }),
    php: function(params, callback) {
        if (_.contains(phpPaths, params.path)) {
            return helpers.common.redirect.call(this, this.app.session.get('url').replace(params.path + '.php', phpRedirections[params.path]));
        }
        statsd.increment([this.app.session.get('location').abbreviation, 'redirections', 'php', this.app.session.get('path')]);
        helpers.common.redirect.call(this, '/');
    },
    allresultsig: function(params, callback) {
        var page = params ? params.page : undefined;
        var filters = params ? params.filters : undefined;
        var url = [];

        url.push('/nf/all-results');
        if (typeof page !== 'undefined' && !isNaN(page) && page !== 'undefined') {
            url.push('-p-');
            url.push(page);
        }
        url.push('-ig');
        if (filters && filters !== 'undefined') {
            url.push('/-');
            url.push(filters);
        }
        helpers.common.redirect.call(this, url.join(''));
    },
    searchfilterig: function(params, callback) {
        var page = params ? params.page : undefined;
        var filters = params ? params.filters : undefined;
        var url = [];

        url.push('/');
        url.push(params.title);
        url.push('-cat-');
        url.push(params.catId);
        url.push('/');
        url.push(params.search || '');
        if (typeof page !== 'undefined' && !isNaN(page) && page !== 'undefined') {
            url.push('/-p-');
            url.push(page);
            url.push('-ig');
        }
        else {
            url.push('/-ig');
        }
        if (filters && filters !== 'undefined') {
            url.push('/-');
            url.push(filters);
        }
        helpers.common.redirect.call(this, url.join(''));
    },
    searchfilter: function(params, callback) {
        var page = params ? params.page : undefined;
        var filters = params ? params.filters : undefined;
        var url = [];

        url.push('/');
        url.push(params.title);
        url.push('-cat-');
        url.push(params.catId);
        url.push('/');
        url.push(params.search || '');
        if (typeof page !== 'undefined' && !isNaN(page) && page !== 'undefined') {
            url.push('/-p-');
            url.push(page);
        }
        if (filters && filters !== 'undefined') {
            url.push('/-');
            url.push(filters);
        }
        helpers.common.redirect.call(this, url.join(''));
    },
    staticSearch: function(params, callback) {
        var page = params ? params.page : undefined;
        var filters = params ? params.filters : undefined;
        var url = [];

        url.push('/q/');
        url.push(params.search);
        if (params.catId) {
            url.push('/c-');
            url.push(params.catId);
        }
        if (typeof page !== 'undefined' && !isNaN(page) && page !== 'undefined') {
            url.push('/-p-');
            url.push(page);
        }
        if (filters && filters !== 'undefined') {
            url.push('/-');
            url.push(filters);
        }
        helpers.common.redirect.call(this, url.join(''));
    },
    staticSearchMobile: function(params, callback) {
        helpers.common.redirect.call(this, this.app.session.get('url').replace('/s/', '/q/'));
    },
    pictures: function(params, callback) {
        statsd.increment([this.app.session.get('location').abbreviation, 'redirections', 'seo', 'pictures']);
        helpers.common.redirect.call(this, this.app.session.get('url').replace('/pictures/', ''));
    },
    users: function(params, callback) {
        statsd.increment([this.app.session.get('location').abbreviation, 'redirections', 'seo', 'users']);
        helpers.common.redirect.call(this, '/', null, {
            status: 302
        });
    },
    userlistings: function(params, callback) {
        statsd.increment([this.app.session.get('location').abbreviation, 'redirections', 'seo', 'userlistings']);
        helpers.common.redirect.call(this, '/');
    }
};
