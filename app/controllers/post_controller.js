'use strict';

var helpers = require('../helpers');
var _ = require('underscore');
var sixpack = require('sixpack-client');
var config = require('../config');

module.exports = {
    index: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var sixpackConfig = config.get('sixpack', {});

            helpers.analytics.reset();
            helpers.analytics.setPage('posting');
            if (!sixpackConfig.enabled ||
                !sixpackConfig['post-button'] ||
                !sixpackConfig['post-button'].enabled ||
                !params.sixpack || params.sixpack !== 'post-button') {
                return callback(null, {
                    analytics: helpers.analytics.generateURL(this.app.getSession())
                });
            }
            var session = new sixpack.Session(this.app.getSession('clientId'), sixpackConfig.url);

            session.convert('post-button', function(err, res) {
                callback(null, {
                    analytics: helpers.analytics.generateURL(this.app.getSession())
                });
            });
        }
    },
    subcat: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var siteLocation = this.app.getSession('siteLocation');
            var categories = this.app.getSession('categories');
            var category = categories._byId[params.categoryId];

            if (!category) {
                this.redirectTo(helpers.common.link('/posting', siteLocation), {
                    status: 301
                });
                return;
            }
            helpers.analytics.reset();
            helpers.analytics.setPage('posting_cat');

            callback(null, _.extend(params, {
                subcategories: category.children,
                analytics: helpers.analytics.generateURL(this.app.getSession())
            }));
        }
    },
    form: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller(form) {
            var app = this.app;
            var user = app.getSession('user');
            var siteLocation = app.getSession('siteLocation');
            var language = app.getSession('selectedLanguage');
            var languages = app.getSession('languages');
            var languageId = languages._byId[language].id;
            var languageCode = languages._byId[language].isocode.toLowerCase();
            var spec = {
                postingSession: {
                    model: 'PostingSession',
                    params: {}
                },
                fields: {
                    collection: 'Fields',
                    params: {
                        intent: 'post',
                        location: siteLocation,
                        categoryId: params.subcategoryId,
                        languageId: languageId,
                        languageCode: languageCode
                    }
                }
            };
            var categories = app.getSession('categories');
            var category = categories._byId[params.categoryId];

            if (!category) {
                this.redirectTo(helpers.common.link('/posting', siteLocation), {
                    status: 301
                });
                return;
            }
            categories = app.getSession('childCategories');
            category = categories[params.subcategoryId];
            if (!category) {
                this.redirectTo(helpers.common.link('/posting/' + params.categoryId, siteLocation), {
                    status: 301
                });
                return;
            }
            app.fetch(spec, function afterFetch(err, result) {
                var response = result.fields.models[0].attributes;
                var categoryTree = helpers.categories.getCatTree(app.getSession(), params.subcategoryId);

                result.postingSession = result.postingSession.get('postingSession');
                result.intent = 'create';
                result.fields = response.fields;
                result.category = categoryTree.parent;
                result.subcategory = categoryTree.subCategory;
                result.language = languageId;
                result.languageCode = languageCode;
                result.siteLocation = siteLocation;
                result.form = form;

                helpers.analytics.reset();
                helpers.analytics.setPage('posting_cat_subcat');
                helpers.analytics.addParam('category', categoryTree.parent);
                helpers.analytics.addParam('subcategory', categoryTree.subCategory);
                result.analytics = helpers.analytics.generateURL(app.getSession());

                callback(err, result);
            });
        }
    },
    edit: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller(form) {
            var app = this.app;
            var user = app.getSession('user');
            var siteLocation = app.getSession('siteLocation');
            var language = app.getSession('selectedLanguage');
            var languages = app.getSession('languages');
            var languageId = languages._byId[language].id;
            var languageCode = languages._byId[language].isocode.toLowerCase();
            var securityKey = params.sk;
            var _params = {
                id: params.itemId,
                languageId: languageId,
                languageCode: languageCode
            };
            var spec = {
                item: {
                    model: 'Item',
                    params: _params
                }
            };

            checkAuthentication(_params, _params.id);
            app.fetch(spec, {
                'readFromCache': false
            }, function afterFetch(err, result) {
                if (err) {
                    return callback(err, result);
                }
                findFields(err, result);
            });

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

            function findFields(err, response) {
                var item = response.item.toJSON();
                var _params = {
                    intent: 'edit',
                    location: siteLocation,
                    languageId: languageId,
                    languageCode: languageCode,
                    itemId: item.id,
                    categoryId: item.category.id
                };
                var spec = {
                    postingSession: {
                        model: 'PostingSession'
                    },
                    fields: {
                        collection: 'Fields',
                        params: _params
                    }
                };

                checkAuthentication(_params, _params.itemId);
                app.fetch(spec, function afterFetch(err, result) {
                    var response = result.fields.models[0].attributes;
                    var categoryTree = helpers.categories.getCatTree(app.getSession(), item.category.id);

                    result.user = user;
                    result.item = item;
                    result.postingSession = result.postingSession.get('postingSession');
                    result.intent = 'edit';
                    result.fields = response.fields;
                    result.category = categoryTree.parent;
                    result.subcategory = categoryTree.subCategory;
                    result.language = languageId;
                    result.languageCode = languageCode;
                    result.errField = params.errField;
                    result.errMsg = params.errMsg;
                    result.sk = securityKey;
                    result.form = form;

                    helpers.analytics.reset();
                    helpers.analytics.setPage('posting_edit');
                    helpers.analytics.addParam('item', item);
                    helpers.analytics.addParam('category', categoryTree.parent);
                    helpers.analytics.addParam('subcategory', categoryTree.subCategory);
                    result.analytics = helpers.analytics.generateURL(app.getSession());

                    callback(err, result);
                });
            }
        }
    },
    success: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var that = this;
            var user = that.app.getSession('user');
            var securityKey = params.sk;
            var itemId = params.itemId;
            var siteLocation = that.app.getSession('siteLocation');
            var anonymousItem;

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

            function findItem(next) {
                var spec = {
                    item: {
                        model: 'Item',
                        params: params
                    }
                };

                that.app.fetch(spec, {
                    'readFromCache': false
                }, function afterFetch(err, result) {
                    if (err) {
                        callback(err, result);
                        return;
                    }
                    next(err, result);
                });
            }

            function findRelatedItems(err, data) {
                var item = data.item.toJSON();
                var spec = {
                    items: {
                        collection : 'Items',
                        params: {
                            location: siteLocation,
                            offset: 0,
                            pageSize:10,
                            relatedAds: itemId
                        }
                    }
                };

                that.app.fetch(spec, {
                    'readFromCache': false
                }, function afterFetch(err, result) {
                    var model = result.items.models[0];
                    var user = that.app.getSession('user');
                    var categoryTree;

                    result.relatedItems = model.get('data');
                    result.user = user;
                    result.item = item;
                    result.pos = Number(params.pos) || 0;
                    result.sk = securityKey;
                    categoryTree = helpers.categories.getCatTree(that.app.getSession(), item.category.id);
                    helpers.analytics.reset();
                    helpers.analytics.setPage('posting_success');
                    helpers.analytics.addParam('item', item);
                    helpers.analytics.addParam('category', categoryTree.parent);
                    helpers.analytics.addParam('subcategory', categoryTree.subCategory);
                    result.analytics = helpers.analytics.generateURL(that.app.getSession());
                    callback(err, result);
                });
            }

            findItem(findRelatedItems);
        }
    }
};
