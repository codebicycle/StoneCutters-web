'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var middlewares = require('../middlewares');
var helpers = require('../helpers');
var tracking = require('../modules/tracking');
var Item = require('../models/item');
var FeatureAd = require('../models/feature_ad');
var config = require('../../shared/config');

module.exports = {
    flow: middlewares(flow),
    flowMarketing: middlewares(flowMarketing),
    subcategories: middlewares(subcategories),
    form: middlewares(form),
    success: middlewares(success),
    edit: middlewares(edit),
    editsuccess: middlewares(editsuccess)
};

function flowMarketing(params, callback) {
    params.marketing = true;
    return flow.call(this, params, callback);
}
function flow(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var user = this.app.session.get('user');
        var siteLocation = this.app.session.get('siteLocation');
        var location = this.app.session.get('location');
        var isPostingFlow = helpers.features.isEnabled.call(this, 'postingFlow');
        var platform = this.app.session.get('platform');
        var languageId = this.app.session.get('languageId');
        var isDesktop = platform === 'desktop';
        var itemId = params.itemId;

        var promise = asynquence().or(error.bind(this))
            .then(prepare.bind(this));

        if (isPostingFlow || isDesktop || itemId) {
            promise
                .then(fetch.bind(this))
                .then(parse.bind(this));
        }
        promise.val(success.bind(this));

        function prepare(done) {
            if ((!isPostingFlow && !isDesktop) && (!siteLocation || siteLocation.indexOf('www.') === 0)) {
                done.abort();
                return helpers.common.redirect.call(this, '/location?target=' + (itemId ? 'myolx/edititem/' + itemId : 'posting'), null, {
                    status: 302
                });
            }
            done();
        }

        function fetch(done) {
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
                        languageId: languageId
                    }
                };
            }
            if (itemId) {
                data.item = {
                    model: 'Item',
                    params: {
                        id: itemId,
                        languageId: languageId
                    }
                };
                data.fields = {
                    model: 'Field',
                    params: {
                        intent: 'edit',
                        itemId: itemId,
                        languageId: languageId
                    }
                };
                if (user) {
                    data.fields.params.token = user.token;
                }
                else if (params.sk) {
                    data.fields.params.securityKey = params.sk;
                }
            }

            this.app.fetch(data, {
                readFromCache: !this.app.session.get('isServer')
            }, done.errfcb);
        }

        function parse(done, res) {
            if (!res.item || !res.fields) {
                return done(res);
            }
            _.each(res.fields.get('fields'), function each(fields) {
                _.each(fields, function each(field) {
                    var index;

                    if (!field.value) {
                        return;
                    }
                    if (res.item.get(field.name) !== undefined) {
                        return res.item.set(field.name, field.value.key || field.value.value);
                    }
                    index = res.item.indexOfOptional(field.name);
                    if (index === undefined) {
                        return;
                    }
                    res.item.get('optionals')[index].value = field.value.key || field.value.value;
                });
            }, this);
            if (res.fields.get('securityKey')) {
                res.item.set('securityKey', res.fields.get('securityKey'));
            }
            done(res);
        }

        function success(res) {
            this.app.seo.addMetatag('robots', 'noindex, nofollow');
            this.app.seo.addMetatag('googlebot', 'noindex, nofollow');
            if (isPostingFlow) {
                if (redirect.call(this, res.item)) {
                    return;
                }
                postingFlowController.call(this, res.postingSession, res.item, res.fields);
            }
            else if (isDesktop) {
                if (redirect.call(this, res.item)) {
                    return;
                }
                postingController.call(this, res.postingSession, res.cities, res.item, res.fields);
            }
            else if (itemId) {
                if (redirect.call(this, res.item)) {
                    return;
                }
                postingFormController.call(this, res.postingSession, res.item, res.fields);
            }
            else {
                postingCategoriesController.call(this);
            }
        }

        function redirect(item) {
            var protocol = this.app.session.get('protocol');
            var host = this.app.session.get('host');
            var shortHost = this.app.session.get('shortHost');
            var url = this.app.session.get('url');
            var user = this.app.session.get('user');

            if (!item) {
                return false;
            }
            if (item.get('status') && !item.get('status').editable) {
                helpers.common.redirect.call(this, '/iid-' + itemId);
                return true;
            }
            if (item.getLocation().url && item.getLocation().url !== siteLocation) {
                helpers.common.redirect.call(this, url, {
                    location: item.getLocation().url
                }, {
                    pushState: false
                });
                return true;
            }
        }

        function postingController(postingSession, cities, item, fields) {
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
                include: ['item'],
                item: item || new Item({}, {
                    app: this.app
                }),
                fields: fields,
                marketing: params.marketing
            }, false);
        }

        function postingFlowController(postingSession, item, fields) {
            callback(null, 'post/flow/index', {
                postingSession: postingSession.get('postingSession'),
                include: ['item', 'fields'],
                item: item || new Item({}, {
                    app: this.app
                }),
                fields: fields
            }, false);
        }

        function postingFormController(postingSession, item, fields) {
            item.set(_.object(_.map(item.get('optionals'), function each(optional) {
                return optional.name;
            }), _.map(item.get('optionals'), function each(optional) {
                return optional.id || optional.value;
            })));
            if (item.has('priceTypeData')) {
                item.set('priceType', item.get('priceTypeData').type);
            }
            if (item.has('price')) {
                item.set('priceC', item.get('price').amount);
            }
            callback(null, 'post/form', {
                item: item,
                postingSession: postingSession.get('postingSession'),
                form: {
                    values: item.toJSON(),
                    errors: (this.app.session.get('form') || {}).errors
                },
                fields: fields.get('fields'),
                category: {
                    id: item.get('category').parentId
                },
                subcategory: {
                    id: item.get('category').id,
                    trName: item.get('category').name
                }
            }, false);
        }

        function postingCategoriesController() {
            tracking.setPage('categories');
            callback(null, 'post/categories', {});
        }

        function error(err) {
            if (itemId && err.status === 400) {
                return helpers.common.redirect.call(this, '/');
            }
            if (itemId && err.status === 401) {
                return helpers.common.redirect.call(this, '/iid-' + itemId);
            }
            helpers.common.error.call(this, err, {}, callback);
        }
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
            var platform = this.app.session.get('platform');
            var spec = {
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
            };

            if (platform === "html4" || platform === "wap") {
                spec.neighborhoods = {
                    collection: 'Neighborhoods',
                    params: {
                        level: 'cities',
                        type: 'neighborhoods',
                        location: siteLocation,
                        languageId: languageId
                    }
                };
            }
            this.app.fetch(spec, {
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
            done(response.postingSession, response.fields, response.neighborhoods);
        }.bind(this);

        var success = function(_postingSession, _field, _neighborhood) {
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
                neighborhoods: _neighborhood ? _neighborhood.toJSON() : undefined,
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
        var itemId = params.itemId;
        var siteLocation = this.app.session.get('siteLocation');
        var languageId = this.app.session.get('languageId');
        var securityKey = params.sk;

        asynquence().or(fail.bind(this))
            .then(prepare.bind(this))
            .then(fetch.bind(this))
            .then(check.bind(this))
            .then(fetchRelated.bind(this))
            .then(fetchFeatured.bind(this))
            .val(successFetch.bind(this));

        function prepare(done) {
            if (user) {
                params.token = user.token;
            }
            params.id = params.itemId;
            params.languageId = languageId;
            delete params.itemId;
            delete params.title;
            delete params.sk;
            done();
        }

        function fetch(done) {
            this.app.fetch({
                item: {
                    model: 'Item',
                    params: params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }

        function check(done, resItem) {
            if (!resItem.item) {
                return done.fail(null, {});
            }
            done(resItem.item);
        }

        function fetchRelated(done, _item) {
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
        }

        function fetchFeatured(done, item, relateds) {
            if (!FeatureAd.isEnabled(this.app)) {
                return done(item, relateds);
            }
            this.app.fetch({
                featuread: {
                    model : 'Feature_ad',
                    params: {
                        id: item.get('id'),
                        locate: this.app.session.get('selectedLanguage')
                    }
                }
            }, {
                readFromCache: false
            }, function afterFetch(err, res) {
                if (err) {
                    res = {};
                }
                item.set('featured', res.featuread);
                done(item, relateds);
            }.bind(this));
        }

        function successFetch(_item, _relatedItems) {
            var item = _item.toJSON();
            var subcategory = this.dependencies.categories.search(item.category.id);
            var category;
            var parentId;

            if (!subcategory) {
                return fail();
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
                securityKey: securityKey,
                category: category.toJSON(),
                subcategory: subcategory.toJSON(),
                relatedItems: _relatedItems
            });
        }

        function fail(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }
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
            else if (securityKey) {
                params.securityKey = securityKey;
                _item.set('securityKey', securityKey);
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

function editsuccess(params, callback) {
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
