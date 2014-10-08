'use strict';

var _ = require('underscore');
var helpers = require('../helpers');
var SECOND = 1000;
var MINUTE = 60 * SECOND;
var HOUR = 60 * MINUTE;

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
                    languageCode: this.app.session.get('selectedLanguage')
                }
            }
        }, {
            readFromCache: false
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
        var location = this.app.session.get('siteLocation');

        this.app.session.persist({
            olx_mobile_full_site_redirect: true
        }, {
            maxAge: 2 * HOUR,
            domain: location.split('.').slice(1).join('.')
        });
        helpers.common.redirect.call(this, 'http://' + location, null, { status: 302 });
    }
};
