'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var helpers = require('../helpers');
var seo = require('../seo');
var analytics = require('../analytics');
var config = require('../config');

module.exports = {
    categoriesOrFlow: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller(form) {
            var siteLocation = this.app.session.get('siteLocation');

            function prepare(done) {
                if (!siteLocation || siteLocation.indexOf('www.') === 0) {
                    done.abort();
                    return helpers.common.redirect.call(this, '/location?target=posting', null, {
                        status: 302
                    });
                }
                done();
            }

            function fetchCategories(done) {
                this.app.fetch({
                    categories: {
                        collection: 'Categories',
                        params: {
                            location: siteLocation,
                            languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
                        }
                    }
                }, {
                    readFromCache: false
                }, done.errfcb);
            }

            function success(res) {
                analytics.reset();
                seo.addMetatag('robots', 'noindex, nofollow');
                seo.addMetatag('googlebot', 'noindex, nofollow');
                seo.update();
                if (this.app.session.get('platform') === 'html5' && config.get(['posting', 'flow', 'enabled', siteLocation], true)) {
                    postingFlowController.call(this, res.categories);
                }
                else {
                    postingCategoriesController.call(this, res.categories);
                }
            }

            function error(err) {
                helpers.common.error.call(this, err, {}, callback);
            }

            asynquence().or(error.bind(this))
                .then(prepare.bind(this))
                .then(fetchCategories.bind(this))
                .val(success.bind(this));

            function postingCategoriesController(categories) {
                callback(null, {
                    analytics: analytics.generateURL.call(this),
                    categories: categories.toJSON()
                });
            }

            function postingFlowController(categories) {
                callback(null, 'post/flow/index', {
                    categories: categories
                });
            }
        }
    },
    subcategories: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var siteLocation = this.app.session.get('siteLocation');

            if (!siteLocation || siteLocation.indexOf('www.') === 0) {
                return helpers.common.redirect.call(this, '/location?target=posting', null, {
                    status: 302
                });
            }
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
            }, function afterFetch(err, result) {
                var category = result.categories.get(params.categoryId);

                if (!category) {
                    return helpers.common.redirect.call(this, '/posting');
                }
                analytics.reset();
                seo.addMetatag('robots', 'noindex, nofollow');
                seo.addMetatag('googlebot', 'noindex, nofollow');
                seo.update();
                callback(null, _.extend(params, {
                    category: category.toJSON(),
                    subcategories: category.get('children').toJSON(),
                    analytics: analytics.generateURL.call(this)
                }));
            }.bind(this));
        }
    },
    form: function(params, callback) {
        helpers.controllers.control.call(this, params, {
            isForm: true
        }, controller);

        function controller(form) {
            var siteLocation = this.app.session.get('siteLocation');
            var language;
            var languages;
            var languageId;
            var languageCode;

            function prepare(done) {
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
            }

            function findCategories(done) {
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
            }

            function findPostingSession(done) {
                this.app.fetch({
                    postingSession: {
                        model: 'PostingSession',
                        params: {}
                    }
                }, {
                    readFromCache: false
                }, done.errfcb);
            }

            function findFields(done) {
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
            }

            function checkFields(done, resCategories, resPostingSession, resFields) {
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
            }

            function success(_categories, _postingSession, _field) {
                var category = _categories.get(params.categoryId);
                var subcategory = category.get('children').get(params.subcategoryId);

                analytics.reset();
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
            }

            function error(err, res) {
                return helpers.common.error.call(this, err, res, callback);
            }

            asynquence().or(error.bind(this))
                .then(prepare.bind(this))
                .gate(findCategories.bind(this), findPostingSession.bind(this), findFields.bind(this))
                .then(checkFields.bind(this))
                .val(success.bind(this));
        }
    },
    success: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var user = this.app.session.get('user');
            var securityKey = params.sk;
            var itemId = params.itemId;
            var siteLocation = this.app.session.get('siteLocation');
            var anonymousItem;
            
            function prepare(done) {
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
            }

            function findCategories(done) {
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
            }

            function findItem(done) {
                this.app.fetch({
                    item: {
                        model: 'Item',
                        params: params
                    }
                }, {
                    readFromCache: false
                }, done.errfcb);
            }

            function checkItem(done, resCategories, resItem) {
                if (!resCategories.categories || !resItem.item) {
                    return done.fail(null, {});
                }
                done(resCategories.categories, resItem.item);
            }

            function findRelatedItems(done, _categories, _item) {
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
            }

            function success(_categories, _item, _relatedItems) {
                var item = _item.toJSON();
                var subcategory = _categories.search(item.category.id);
                var category;
                var parentId;

                if (!subcategory) {
                    console.log('[OLX_DEBUG] No subcategory ' + item.category.id + ' for item ' + item.id + ' (' + itemId + ') on ' + siteLocation + ' (' + _categories.length + ') - Controller ' + this.currentRoute.controller + ' / Action ' + this.currentRoute.action);
                    return error.call(this);
                }
                parentId = subcategory.get('parentId');
                category = parentId ? _categories.get(parentId) : subcategory;

                analytics.reset();
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
            }

            function error(err, res) {
                return helpers.common.error.call(this, err, res, callback);
            }

            asynquence().or(error.bind(this))
                .then(prepare.bind(this))
                .gate(findCategories.bind(this), findItem.bind(this))
                .then(checkItem.bind(this))
                .then(findRelatedItems.bind(this))
                .val(success.bind(this));
        }
    },
    edit: function(params, callback) {
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

            function prepare(done) {
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
            }

            function findCategories(done) {
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
            }

            function findItem(done) {
                this.app.fetch({
                    item: {
                        model: 'Item',
                        params: _params
                    }
                }, {
                    readFromCache: false
                }, done.errfcb);
            }

            function checkItem(done, resCategories, resItem) {
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
            }

            function findPostingSession(done) {
                this.app.fetch({
                    postingSession: {
                        model: 'PostingSession',
                        params: {}
                    }
                }, {
                    readFromCache: false
                }, done.errfcb);
            }

            function findFields(done) {
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
            }

            function checkFields(done, resPostingSession, resField) {
                if (!resPostingSession.postingSession || !resField.fields) {
                    done.abort();
                    return done.fail(null, {});
                }
                done(resPostingSession.postingSession, resField.fields);
            }

            function success(_postingSession, _field) {
                var item = _item.toJSON();
                var subcategory = _categories.search(item.category.id);
                var category;
                var parentId;
                var _form;

                if (!subcategory) {
                    console.log('[OLX_DEBUG] No subcategory ' + item.category.id + ' on ' + siteLocation + ' (' + _categories.length + ') - Controller ' + this.currentRoute.controller + ' / Action ' + this.currentRoute.action);
                    return error.call(this);
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
                analytics.reset();
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
            }

            function error(err, res) {
                return helpers.common.error.call(this, err, res, callback);
            }

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

            asynquence().or(error.bind(this))
                .then(prepare.bind(this))
                .gate(findCategories.bind(this), findItem.bind(this))
                .then(checkItem.bind(this))
                .gate(findPostingSession.bind(this), findFields.bind(this))
                .then(checkFields.bind(this))
                .val(success.bind(this));
        }
    }
};
