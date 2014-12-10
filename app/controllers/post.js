'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var middlewares = require('../middlewares');
var helpers = require('../helpers');
var tracking = require('../modules/tracking');
var Item = require('../models/item');
var config = require('../../shared/config');

module.exports = {
    flow: middlewares(flow),
    subcategories: middlewares(subcategories),
    form: middlewares(form),
    success: middlewares(success),
    edit: middlewares(edit)
};

function flow(params, callback) {
    helpers.controllers.control.call(this, params, controller);
    function controller() {
        var user = this.app.session.get('user');
        var siteLocation = this.app.session.get('siteLocation');
        var location = this.app.session.get('location');
        var isPostingFlow = helpers.features.isEnabled.call(this, 'postingFlow');
        var platform = this.app.session.get('platform');
        var isDesktop = platform === 'desktop';
        var itemId = params.itemId;

        var prepare = function(done) {
            if ((!isPostingFlow && !isDesktop) && (!siteLocation || siteLocation.indexOf('www.') === 0)) {
                done.abort();
                return helpers.common.redirect.call(this, '/location?target=posting', null, {
                    status: 302
                });
            }
            if (user) {
                params.token = user.token;
            }
            done();
        }.bind(this);

        var fetch = function(done) {
            var data = {};
            var locationUrl;

            data.postingSession = {
                model: 'PostingSession',
                params: {}
            };

            if (isDesktop && location.current) {
                if (location.current.type === 'state') {
                    locationUrl = location.url;
                }
                else if (location.current.type === 'city') {
                    locationUrl = location.children[0].url;
                }
                data.cities = {
                    collection: 'Cities',
                    params: {
                        level: 'states',
                        type: 'cities',
                        location: locationUrl,
                        languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
                    }
                };
            }
            if ((isDesktop || isPostingFlow) && itemId) {
                data.item = {
                    model: 'Item',
                    params: {
                        id: itemId,
                        languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
                    }
                };
                data.fields = {
                    model: 'Field',
                    params: {
                        intent: 'edit',
                        itemId: itemId,
                        languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id,
                        token: params.token
                    }
                };
            }

            this.app.fetch(data, {
                readFromCache: !this.app.session.get('isServer'),
                store: true
            }, done.errfcb);
        }.bind(this);

        var success = function(res) {
            this.app.seo.addMetatag('robots', 'noindex, nofollow');
            this.app.seo.addMetatag('googlebot', 'noindex, nofollow');
            if (isPostingFlow) {
                postingFlowController(res.postingSession, res.item, res.fields);
            }
            else if (isDesktop) {
                postingController(res.postingSession, res.cities, res.item, res.fields);
            }
            else {
                postingCategoriesController();
            }
        }.bind(this);

        var postingController = function(postingSession, cities, item, fields) {
            var currentLocation = {};

            tracking.setPage('desktop_step1');
            if (location.current) {
                switch (location.current.type) {
                    case 'state':
                        currentLocation.state = location.current.url;
                        break;
                    case 'city':
                        currentLocation.state = location.children[0].url;
                        currentLocation.city = location.current.url;
                        break;
                    default:
                        break;
                }
            }

            callback(null, 'post/index', {
                postingSession: postingSession.get('postingSession'),
                cities: cities,
                currentLocation: currentLocation,
                item: item || new Item(),
                fields: fields
            }, false);
        }.bind(this);

        var postingFlowController = function(postingSession, item, fields) {
            callback(null, 'post/flow/index', {
                postingSession: postingSession.get('postingSession'),
                item: item || new Item()
            }, false);
        }.bind(this);

        var postingCategoriesController = function() {
            tracking.setPage('categories');
            callback(null, 'post/categories', {});
        }.bind(this);

        var error = function(err) {
            helpers.common.error.call(this, err, {}, callback);
        }.bind(this);

        var promise = asynquence().or(error)
            .then(prepare);

        if (isPostingFlow || isDesktop) {
            promise.then(fetch);
        }
        promise.val(success);
    }
}

function subcategories(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var siteLocation = this.app.session.get('siteLocation');
        var location = this.app.session.get('location');
        var isPostingFlow = helpers.features.isEnabled.call(this, 'postingFlow');
        var category;

        var redirect = function(done) {
            var platform = this.app.session.get('platform');
            var redirect;

            if (isPostingFlow || platform === 'desktop') {
                redirect = '/posting';
            }
            else if (!siteLocation || siteLocation.indexOf('www.') === 0) {
                redirect = '/location?target=posting';
            }
            if (redirect) {
                return helpers.common.redirect.call(this, redirect, null, {
                    status: 302
                });
            }
            category = this.dependencies.categories.get(params.categoryId);
            if (!category) {
                return helpers.common.redirect.call(this, '/posting');
            }
            done();
        }.bind(this);

        var success = function() {
            this.app.seo.addMetatag('robots', 'noindex, nofollow');
            this.app.seo.addMetatag('googlebot', 'noindex, nofollow');
            callback(null, _.extend(params, {
                category: category.toJSON(),
                subcategories: category.get('children').toJSON()
            }));
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .val(success);
    }
}

function form(params, callback) {
    helpers.controllers.control.call(this, params, {
        isForm: true
    }, controller);

    function controller() {
        var siteLocation = this.app.session.get('siteLocation');
        var location = this.app.session.get('location');
        var isPostingFlow = helpers.features.isEnabled.call(this, 'postingFlow');

        var language;
        var languages;
        var languageId;

        var prepare = function(done) {
            var platform = this.app.session.get('platform');
            var redirect;

            if (isPostingFlow || platform === 'desktop') {
                redirect = '/posting';
            }
            else if (!siteLocation || siteLocation.indexOf('www.') === 0) {
                redirect = '/location?target=posting';
            }
            if (redirect) {
                done.abort();
                return helpers.common.redirect.call(this, redirect, null, {
                    status: 302
                });
            }
            language = this.app.session.get('selectedLanguage');
            languages = this.app.session.get('languages');
            languageId = languages._byId[language].id;
            done();
        }.bind(this);

        var fetch = function(done) {
            this.app.fetch({
                postingSession: {
                    model: 'PostingSession',
                    params: {}
                },
                fields: {
                    model: 'Field',
                    params: {
                        intent: 'post',
                        location: siteLocation,
                        categoryId: params.subcategoryId,
                        languageId: languageId
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var check = function(done, response) {
            if (!response.postingSession || !response.fields) {
                return done.fail(null, {});
            }
            var category = this.dependencies.categories.get(params.categoryId);
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
            done(response.postingSession, response.fields);
        }.bind(this);

        var success = function(_postingSession, _field) {
            var category = this.dependencies.categories.get(params.categoryId);
            var subcategory = category.get('children').get(params.subcategoryId);

            tracking.addParam('category', category.toJSON());
            tracking.addParam('subcategory', subcategory.toJSON());
            this.app.seo.addMetatag('robots', 'noindex, nofollow');
            this.app.seo.addMetatag('googlebot', 'noindex, nofollow');
            callback(null, {
                postingSession: _postingSession.get('postingSession'),
                intent: 'create',
                fields: _field.attributes.fields,
                category: category.toJSON(),
                subcategory: subcategory.toJSON(),
                language: languageId,
                siteLocation: siteLocation,
                form: this.form
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(prepare)
            .then(fetch)
            .then(check)
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
        var languages = this.app.session.get('languages');
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
            params.languageId = languages._byId[this.app.session.get('selectedLanguage')].id;
            delete params.itemId;
            delete params.title;
            delete params.sk;
            done();
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

        var checkItem = function(done, resItem) {
            if (!resItem.item) {
                return done.fail(null, {});
            }
            done(resItem.item);
        }.bind(this);

        var findRelatedItems = function(done, _item) {
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
                done(_item, res.relatedItems);
            }.bind(this));
        }.bind(this);

        var success = function(_item, _relatedItems) {
            var item = _item.toJSON();
            var subcategory = this.dependencies.categories.search(item.category.id);
            var category;
            var parentId;

            if (!subcategory) {
                return error();
            }
            parentId = subcategory.get('parentId');
            category = parentId ? this.dependencies.categories.get(parentId) : subcategory;

            tracking.addParam('item', item);
            tracking.addParam('category', category.toJSON());
            tracking.addParam('subcategory', subcategory.toJSON());
            this.app.seo.addMetatag('robots', 'noindex, nofollow');
            this.app.seo.addMetatag('googlebot', 'noindex, nofollow');
            callback(null, {
                user: user,
                item: item,
                sk: securityKey,
                category: category.toJSON(),
                subcategory: subcategory.toJSON(),
                relatedItems: _relatedItems
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(prepare)
            .then(findItem)
            .then(checkItem)
            .then(findRelatedItems)
            .val(success);
    }
}

function edit(params, callback) {
    helpers.controllers.control.call(this, params, {
        isForm: true
    }, controller);

    function controller() {
        var user = this.app.session.get('user');
        var securityKey = params.sk;
        var siteLocation;
        var language;
        var languages;
        var languageId;
        var _params;
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
            _params = {
                id: params.itemId,
                languageId: languageId
            };
            checkAuthentication(_params, _params.id);
            done();
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

        var checkItem = function(done, resItem) {
            if (!resItem.item) {
                return done.fail(null, {});
            }
            var protocol = this.app.session.get('protocol');
            var platform = this.app.session.get('platform');
            var currentLocation = this.app.session.get('location');
            var location = resItem.item.get('location');
            var url;

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
            var subcategory = this.dependencies.categories.search(item.category.id);
            var category;
            var parentId;
            var _form;

            if (!subcategory) {
                return error();
            }
            parentId = subcategory.get('parentId');
            category = parentId ? this.dependencies.categories.get(parentId) : subcategory;

            if (!form || !form.values) {
                _form = {
                    values: item
                };
            }
            else {
                _form = form;
            }
            tracking.addParam('item', item);
            tracking.addParam('category', category.toJSON());
            tracking.addParam('subcategory', subcategory.toJSON());
            callback(null, {
                item: item,
                user: user,
                postingSession: _postingSession.get('postingSession'),
                intent: 'edit',
                fields: _field.attributes.fields,
                category: category.toJSON(),
                subcategory: subcategory.toJSON(),
                language: languageId,
                errField: params.errField,
                errMsg: params.errMsg,
                sk: securityKey,
                form: _form
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
            .then(findItem)
            .then(checkItem)
            .gate(findPostingSession, findFields)
            .then(checkFields)
            .val(success);
    }
}
