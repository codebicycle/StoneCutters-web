'use strict';

var helpers = require('../helpers');
var _ = require('underscore');
var sixpackName = 'sixpack-client';
var sixpack = require(sixpackName);
var config = require('../config');

module.exports = {
    index: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
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
                var sixpackConfig = config.get('sixpack', {});

                helpers.analytics.reset();
                if (!sixpackConfig.enabled ||
                    !sixpackConfig['post-button'] ||
                    !sixpackConfig['post-button'].enabled ||
                    !params.sixpack || params.sixpack !== 'post-button') {
                    return callback(null, {
                        analytics: helpers.analytics.generateURL(this.app.session.get()),
                        categories: result.categories.toJSON()
                    });
                }
                var session = new sixpack.Session(this.app.session.get('clientId'), sixpackConfig.url);

                session.convert('post-button', function(err, res) {
                    callback(null, {
                        analytics: helpers.analytics.generateURL(this.app.session.get()),
                        categories: result.categories.toJSON()
                    });
                });
            }.bind(this));
        }
    },
    subcat: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
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
                var category = result.categories.get(params.categoryId);

                if (!category) {
                    return helpers.common.redirect.call(this, '/posting');
                }
                helpers.analytics.reset();
                callback(null, _.extend(params, {
                    category: category.toJSON(),
                    subcategories: category.get('children').toJSON(),
                    analytics: helpers.analytics.generateURL(this.app.session.get())
                }));
            }.bind(this));
        }
    },
    form: function(params, callback) {
        helpers.controllers.control.call(this, params, true, controller);

        function controller(form) {
            var app = this.app;
            var user = app.session.get('user');
            var siteLocation = app.session.get('siteLocation');
            var language = app.session.get('selectedLanguage');
            var languages = app.session.get('languages');
            var languageId = languages._byId[language].id;
            var languageCode = languages._byId[language].isocode.toLowerCase();
            var spec = {
                categories: {
                    collection: 'Categories',
                    params: {
                        location: siteLocation,
                        languageCode: language
                    }
                },
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
            app.fetch(spec, function afterFetch(err, result) {
                var category = result.categories.get(params.categoryId);
                if (!category) {
                    return helpers.common.redirect.call(this, '/posting');
                }
                var subcategory = category.get('children').get(params.subcategoryId);
                if (!subcategory) {
                    return helpers.common.redirect.call(this, '/posting/' + params.categoryId);
                }
                var response = result.fields.models[0].attributes;

                result.postingSession = result.postingSession.get('postingSession');
                result.intent = 'create';
                result.fields = response.fields;
                result.category = category.toJSON();
                result.subcategory = subcategory.toJSON();
                result.language = languageId;
                result.languageCode = languageCode;
                result.siteLocation = siteLocation;
                result.form = form;
                helpers.analytics.reset();
                helpers.analytics.addParam('category', category.toJSON());
                helpers.analytics.addParam('subcategory', subcategory.toJSON());
                result.analytics = helpers.analytics.generateURL(app.session.get());
                callback(err, result);
            });
        }
    },
    edit: function(params, callback) {
        helpers.controllers.control.call(this, params, true, controller);

        function controller(form) {
            var app = this.app;
            var user = app.session.get('user');
            var siteLocation = app.session.get('siteLocation');
            var language = app.session.get('selectedLanguage');
            var languages = app.session.get('languages');
            var languageId = languages._byId[language].id;
            var languageCode = languages._byId[language].isocode.toLowerCase();
            var securityKey = params.sk;
            var _params = {
                id: params.itemId,
                languageId: languageId,
                languageCode: languageCode
            };
            var spec = {
                categories: {
                    collection: 'Categories',
                    params: {
                        location: siteLocation,
                        languageCode: language
                    }
                },
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
                findFields(null, result);
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
                        model: 'PostingSession',
                        params: {}
                    },
                    fields: {
                        collection: 'Fields',
                        params: _params
                    }
                };

                checkAuthentication(_params, _params.itemId);
                app.fetch(spec, function afterFetch(err, result) {
                    var subcategory = response.categories.search(item.category.id);
                    var category = response.categories.get(subcategory.get('parentId'));

                    result.user = user;
                    result.postingSession = result.postingSession.get('postingSession');
                    result.intent = 'edit';
                    result.fields = result.fields.models[0].attributes.fields;
                    result.category = category.toJSON();
                    result.subcategory = subcategory.toJSON();
                    result.language = languageId;
                    result.languageCode = languageCode;
                    result.errField = params.errField;
                    result.errMsg = params.errMsg;
                    result.sk = securityKey;
                    if (!form || !form.values) {
                        result.form = {
                            values: item
                        };
                    }
                    else {
                        result.form = form;
                    }
                    helpers.analytics.reset();
                    helpers.analytics.addParam('item', item);
                    helpers.analytics.addParam('category', category.toJSON());
                    helpers.analytics.addParam('subcategory', subcategory.toJSON());
                    result.analytics = helpers.analytics.generateURL(app.session.get());
                    callback(err, result);
                });
            }
        }
    },
    success: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var app = this.app;
            var user = app.session.get('user');
            var securityKey = params.sk;
            var itemId = params.itemId;
            var siteLocation = app.session.get('siteLocation');
            var anonymousItem;
            var spec;

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

            spec = {
                categories: {
                    collection: 'Categories',
                    params: {
                        location: siteLocation,
                        languageCode: this.app.session.get('selectedLanguage')
                    }
                },
                item: {
                    model: 'Item',
                    params: params
                }
            };
            app.fetch(spec, {
                'readFromCache': false
            }, function afterFetch(err, result) {
                if (err) {
                    callback(err, result);
                    return;
                }
                findRelatedItems.call(this, err, result);
            });

            function findRelatedItems(err, data) {
                var item = data.item.toJSON();
                var spec = {
                    items: {
                        collection : 'Items',
                        params: {
                            location: siteLocation,
                            offset: 0,
                            pageSize: 10,
                            relatedAds: itemId
                        }
                    }
                };

                app.fetch(spec, {
                    'readFromCache': false
                }, function afterFetch(err, result) {
                    var model = result.items.models[0];
                    var user = app.session.get('user');
                    var subcategory = data.categories.search(item.category.id);
                    var category = data.categories.get(subcategory.get('parentId'));

                    result.relatedItems = model.get('data');
                    result.user = user;
                    result.item = item;
                    result.pos = Number(params.pos) || 0;
                    result.sk = securityKey;
                    result.category = category.toJSON();
                    helpers.analytics.reset();
                    helpers.analytics.addParam('item', item);
                    helpers.analytics.addParam('category', category.toJSON());
                    helpers.analytics.addParam('subcategory', subcategory.toJSON());
                    result.analytics = helpers.analytics.generateURL(app.session.get());
                    callback(err, result);
                });
            }
        }
    }
};
