'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var middlewares = require('../middlewares');
var helpers = require('../helpers');
var seo = require('../modules/seo');
var analytics = require('../modules/analytics');
var config = require('../../shared/config');

module.exports = {
    categories: middlewares(categories),
    subcategories: middlewares(subcategories),
    form: middlewares(form),
    success: middlewares(success),
    edit: middlewares(edit)
};

function categories(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var siteLocation = this.app.session.get('siteLocation');

        var prepare = function(done) {
            if (!siteLocation || siteLocation.indexOf('www.') === 0) {
                done.abort();
                return helpers.common.redirect.call(this, '/location?target=posting', null, {
                    status: 302
                });
            }
            done();
        }.bind(this);

        var fetch = function(done) {
            this.app.fetch({
                categories: {
                    collection: 'Categories',
                    params: {
                        location: siteLocation,
                        languageCode: this.app.session.get('selectedLanguage')
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var success = function(response) {
            seo.addMetatag('robots', 'noindex, nofollow');
            seo.addMetatag('googlebot', 'noindex, nofollow');
            seo.update();
            callback(null, {
                analytics: analytics.generateURL.call(this),
                categories: response.categories.toJSON()
            });
        }.bind(this);

        var error = function(err) {
            helpers.common.error.call(this, err, null, callback);
        }.bind(this);

        asynquence().or(error)
            .then(prepare)
            .then(fetch)
            .val(success);
    }
}

function subcategories(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var siteLocation = this.app.session.get('siteLocation');

        var prepare = function(done) {
            if (!siteLocation || siteLocation.indexOf('www.') === 0) {
                done.abort();
                return helpers.common.redirect.call(this, '/location?target=posting', null, {
                    status: 302
                });
            }
            done();
        }.bind(this);

        var fetch = function(done) {
            this.app.fetch({
                categories: {
                    collection: 'Categories',
                    params: {
                        location: siteLocation,
                        languageCode: this.app.session.get('selectedLanguage')
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var success = function(response) {
            var category = response.categories.get(params.categoryId);

            if (!category) {
                return helpers.common.redirect.call(this, '/posting');
            }
            seo.addMetatag('robots', 'noindex, nofollow');
            seo.addMetatag('googlebot', 'noindex, nofollow');
            seo.update();
            callback(null, _.extend(params, {
                category: category.toJSON(),
                subcategories: category.get('children').toJSON(),
                analytics: analytics.generateURL.call(this)
            }));
        }.bind(this);

        var error = function(err) {
            helpers.common.error.call(this, err, null, callback);
        }.bind(this);

        asynquence().or(error)
            .then(prepare)
            .then(fetch)
            .val(success);
    }
}

function form(params, callback) {
    helpers.controllers.control.call(this, params, {
        isForm: true
    }, controller);

    function controller(form) {
        var siteLocation = this.app.session.get('siteLocation');
        var language;
        var languages;
        var languageId;
        var languageCode;

        var prepare = function(done) {
            if (!siteLocation || siteLocation.indexOf('www.') === 0) {
                done.abort();
                return helpers.common.redirect.call(this, '/location?target=posting', null, {
                    status: 302
                });
            }
            language = this.app.session.get('selectedLanguage');
            languages = this.app.session.get('languages');
            languageId = languages._byId[language].id;
            languageCode = languages._byId[language].isocode.toLowerCase();
            done();
        }.bind(this);

        var findCategories = function(done) {
            this.app.fetch({
                categories: {
                    collection: 'Categories',
                    params: {
                        location: siteLocation,
                        languageCode: language
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var findPostingSession = function(done) {
            this.app.fetch({
                postingSession: {
                    model: 'PostingSession',
                    params: {}
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var findFields = function(done) {
            this.app.fetch({
                fields: {
                    model: 'Field',
                    params: {
                        intent: 'post',
                        location: siteLocation,
                        categoryId: params.subcategoryId,
                        languageId: languageId,
                        languageCode: languageCode
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var checkFields = function(done, resCategories, resPostingSession, resFields) {
            if (!resCategories.categories || !resPostingSession.postingSession || !resFields.fields) {
                done.abort();
                return done.fail(null, {});
            }
            var category = resCategories.categories.get(params.categoryId);
            var subcategory;

            if (!category) {
                done.abort();
                return helpers.common.redirect.call(this, '/posting');
            }
            subcategory = category.get('children').get(params.subcategoryId);
            if (!subcategory) {
                done.abort();
                return helpers.common.redirect.call(this, '/posting/' + params.categoryId);
            }
            done(resCategories.categories, resPostingSession.postingSession, resFields.fields);
        }.bind(this);

        var success = function(_categories, _postingSession, _field) {
            var category = _categories.get(params.categoryId);
            var subcategory = category.get('children').get(params.subcategoryId);

            analytics.addParam('category', category.toJSON());
            analytics.addParam('subcategory', subcategory.toJSON());
            seo.addMetatag('robots', 'noindex, nofollow');
            seo.addMetatag('googlebot', 'noindex, nofollow');
            seo.update();
            callback(null, {
                postingSession: _postingSession.get('postingSession'),
                intent: 'create',
                fields: _field.attributes.fields,
                category: category.toJSON(),
                subcategory: subcategory.toJSON(),
                language: languageId,
                languageCode: languageCode,
                siteLocation: siteLocation,
                form: form,
                analytics: analytics.generateURL.call(this)
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(prepare)
            .gate(findCategories, findPostingSession, findFields)
            .then(checkFields)
            .val(success);
    }
}

function success(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var user = this.app.session.get('user');
        var securityKey = params.sk;
        var itemId = params.itemId;
        var siteLocation = this.app.session.get('siteLocation');
        var anonymousItem;

        var prepare = function(done) {
            if (user) {
                params.token = user.token;
            }
            else if (typeof window !== 'undefined' && localStorage) {
                anonymousItem = localStorage.getItem('anonymousItem');
                anonymousItem = (!anonymousItem ? {} : JSON.parse(anonymousItem));
                if (securityKey) {
                    anonymousItem[params.itemId] = securityKey;
                    localStorage.setItem('anonymousItem', JSON.stringify(anonymousItem));
                }
                else {
                    securityKey = anonymousItem[params.itemId];
                }
            }
            params.id = params.itemId;
            delete params.itemId;
            delete params.title;
            delete params.sk;
            done();
        }.bind(this);

        var findCategories = function(done) {
            this.app.fetch({
                categories: {
                    collection : 'Categories',
                    params: {
                        location: siteLocation,
                        languageCode: this.app.session.get('selectedLanguage')
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var findItem = function(done) {
            this.app.fetch({
                item: {
                    model: 'Item',
                    params: params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var checkItem = function(done, resCategories, resItem) {
            if (!resCategories.categories || !resItem.item) {
                return done.fail(null, {});
            }
            done(resCategories.categories, resItem.item);
        }.bind(this);

        var findRelatedItems = function(done, _categories, _item) {
            this.app.fetch({
                relatedItems: {
                    collection : 'Items',
                    params: {
                        location: siteLocation,
                        offset: 0,
                        pageSize: 10,
                        relatedAds: itemId
                    }
                }
            }, {
                readFromCache: false
            }, function afterFetch(err, res) {
                if (err) {
                    err = null;
                    res = {
                        relatedItems: []
                    };
                }
                else {
                    res.relatedItems = res.relatedItems.toJSON();
                }
                done(_categories, _item, res.relatedItems);
            }.bind(this));
        }.bind(this);

        var success = function(_categories, _item, _relatedItems) {
            var item = _item.toJSON();
            var subcategory = _categories.search(item.category.id);
            var category;
            var parentId;

            if (!subcategory) {
                return error();
            }
            parentId = subcategory.get('parentId');
            category = parentId ? _categories.get(parentId) : subcategory;

            analytics.addParam('item', item);
            analytics.addParam('category', category.toJSON());
            analytics.addParam('subcategory', subcategory.toJSON());
            seo.addMetatag('robots', 'noindex, nofollow');
            seo.addMetatag('googlebot', 'noindex, nofollow');
            seo.update();
            callback(null, {
                user: user,
                item: item,
                sk: securityKey,
                category: category.toJSON(),
                subcategory: subcategory.toJSON(),
                relatedItems: _relatedItems,
                analytics: analytics.generateURL.call(this)
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(prepare)
            .gate(findCategories, findItem)
            .then(checkItem)
            .then(findRelatedItems)
            .val(success);
    }
}

function edit(params, callback) {
    helpers.controllers.control.call(this, params, {
        isForm: true
    }, controller);

    function controller(form) {
        var user = this.app.session.get('user');
        var securityKey = params.sk;
        var siteLocation;
        var language;
        var languages;
        var languageId;
        var languageCode;
        var _params;
        var _categories;
        var _item;

        var prepare = function(done) {
            if (!user && !securityKey) {
                done.abort();
                return helpers.common.redirect.call(this, '/login', null, {
                    status: 302
                });
            }

            siteLocation = this.app.session.get('siteLocation');
            language = this.app.session.get('selectedLanguage');
            languages = this.app.session.get('languages');
            languageId = languages._byId[language].id;
            languageCode = languages._byId[language].isocode.toLowerCase();
            _params = {
                id: params.itemId,
                languageId: languageId,
                languageCode: languageCode
            };
            checkAuthentication(_params, _params.id);
            done();
        }.bind(this);

        var findCategories = function(done) {
            this.app.fetch({
                categories: {
                    collection : 'Categories',
                    params: {
                        location: siteLocation,
                        languageCode: language
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var findItem = function(done) {
            this.app.fetch({
                item: {
                    model: 'Item',
                    params: _params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var checkItem = function(done, resCategories, resItem) {
            if (!resCategories.categories || !resItem.item) {
                return done.fail(null, {});
            }
            var protocol = this.app.session.get('protocol');
            var platform = this.app.session.get('platform');
            var currentLocation = this.app.session.get('location');
            var location = resItem.item.get('location');
            var url;

            _categories = resCategories.categories;
            _item = resItem.item;

            if (location.url !== currentLocation.url) {
                url = [protocol, '://', platform, '.', location.url.replace('www.', 'm.'), '/login'].join('');
                done.abort();
                return helpers.common.redirect.call(this, url, null, {
                    pushState: false,
                    query: {
                        location: _item.getLocation().url
                    }
                });
            }
            done();
        }.bind(this);

        var findPostingSession = function(done) {
            this.app.fetch({
                postingSession: {
                    model: 'PostingSession',
                    params: {}
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var findFields = function(done) {
            var _params = {
                intent: 'edit',
                location: siteLocation,
                languageId: languageId,
                languageCode: languageCode,
                itemId: _item.get('id'),
                categoryId: _item.get('category').id
            };

            checkAuthentication(_params, _params.itemId);
            this.app.fetch({
                fields: {
                    model: 'Field',
                    params: _params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var checkFields = function(done, resPostingSession, resField) {
            if (!resPostingSession.postingSession || !resField.fields) {
                done.abort();
                return done.fail(null, {});
            }
            done(resPostingSession.postingSession, resField.fields);
        }.bind(this);

        var success = function(_postingSession, _field) {
            var item = _item.toJSON();
            var subcategory = _categories.search(item.category.id);
            var category;
            var parentId;
            var _form;

            if (!subcategory) {
                return error();
            }
            parentId = subcategory.get('parentId');
            category = parentId ? _categories.get(parentId) : subcategory;

            if (!form || !form.values) {
                _form = {
                    values: item
                };
            }
            else {
                _form = form;
            }
            analytics.addParam('item', item);
            analytics.addParam('category', category.toJSON());
            analytics.addParam('subcategory', subcategory.toJSON());
            callback(null, {
                item: item,
                user: user,
                postingSession: _postingSession.get('postingSession'),
                intent: 'edit',
                fields: _field.attributes.fields,
                category: category.toJSON(),
                subcategory: subcategory.toJSON(),
                language: languageId,
                languageCode: languageCode,
                errField: params.errField,
                errMsg: params.errMsg,
                sk: securityKey,
                form: _form,
                analytics: analytics.generateURL.call(this)
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        function checkAuthentication(params, id) {
            var anonymousItem;

            if (user) {
                params.token = user.token;
            }
            else {
                if (typeof window !== 'undefined' && localStorage) {
                    anonymousItem = localStorage.getItem('anonymousItem');
                    anonymousItem = (!anonymousItem ? {} : JSON.parse(anonymousItem));
                    if (securityKey) {
                        anonymousItem[id] = securityKey;
                        localStorage.setItem('anonymousItem', JSON.stringify(anonymousItem));
                    }
                    else {
                        securityKey = anonymousItem[id];
                    }
                }
                params.securityKey = securityKey;
            }
        }

        asynquence().or(error)
            .then(prepare)
            .gate(findCategories, findItem)
            .then(checkItem)
            .gate(findPostingSession, findFields)
            .then(checkFields)
            .val(success);
    }
}
