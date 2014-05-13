'use strict';

var helpers = require('../helpers');
var _ = require('underscore');
var sixpack = require('sixpack-client');
var config = require('../config');

module.exports = {
    index: function(params, callback) {
        helpers.controllers.control(this, params, controller);

        function controller() {
            var sixpackConfig = config.get('sixpack', {});

            if (!sixpackConfig.enabled ||
                !sixpackConfig['post-button'] ||
                !sixpackConfig['post-button'].enabled ||
                !params.sixpack || params.sixpack !== 'post-button') {
                return callback(null, {});
            }
            var session = new sixpack.Session(this.app.getSession('clientId'), 'http://localhost:5000');

            session.convert('post-button', function(err, res) {
                callback(null, {});
            });
        }
    },
    subcat: function(params, callback) {
        helpers.controllers.control(this, params, controller);

        function controller() {
            callback(null, _.extend(params, {
                subcategories: this.app.getSession('categories')._byId[params.categoryId].children
            }));
        }
    },
    form: function(params, callback) {
        helpers.controllers.control(this, params, controller);

        function controller() {
            var siteLocation = this.app.getSession('siteLocation');
            var language = this.app.getSession('selectedLanguage');
            var languages = this.app.getSession('languages');
            var languageId = languages._byId[language].id;
            var spec = {
                postingSession: {
                    model: 'PostingSession'
                },
                fields: {
                    collection: 'Fields',
                    params: {
                        intent: 'post',
                        location: siteLocation,
                        categoryId: params.subcategoryId,
                        languageId: languageId,
                        languageCode: language
                    }
                }
            };

            this.app.fetch(spec, function afterFetch(err, result) {
                var response = result.fields.models[0].attributes;
                result.postingSession = result.postingSession.get('postingSession');
                result.intent = 'create';
                result.fields = response.fields;
                result.errors = params.err;
                result.category = params.categoryId;
                result.subcategory = params.subcategoryId;
                result.language = languageId;
                result.languageCode = language;
                result.errField = params.errField;
                result.errMsg = params.errMsg;
                callback(err, result);
            });
        }
    },
    edit: function(params, callback) {
        helpers.controllers.control(this, params, controller);

        function controller() {
            var user = this.app.getSession('user');
            var siteLocation = this.app.getSession('siteLocation');
            var language = this.app.getSession('selectedLanguage');
            var languages = this.app.getSession('languages');
            var languageId = languages._byId[language].id;
            var securityKey = params.sk;
            var _params = {
                id: params.itemId,
                languageId: languageId,
                languageCode: language
            };
            var spec = {
                item: {
                    model: 'Item',
                    params: _params
                }
            };
            var app = this.app;

            checkAuthentication(_params, _params.id);
            this.app.fetch(spec, {
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
                    languageCode: language,
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

                    result.user = user;
                    result.item = item;
                    result.postingSession = result.postingSession.get('postingSession');
                    result.intent = 'edit';
                    result.fields = response.fields;
                    result.errors = params.err;
                    result.category = item.category.parentId;
                    result.subcategory = item.category.id;
                    result.language = languageId;
                    result.languageCode = language;
                    result.errField = params.errField;
                    result.errMsg = params.errMsg;
                    result.sk = securityKey;
                    callback(err, result);
                });
            }
        }
    },
    success: function(params, callback) {
        helpers.controllers.control(this, params, controller);

        function controller() {
            var user = this.app.getSession('user');
            var siteLocation = this.app.getSession('siteLocation');
            var language = this.app.getSession('selectedLanguage');
            var languages = this.app.getSession('languages');
            var languageId = languages._byId[language].id;
            var securityKey = params.sk;
            var _params = {
                id: params.itemId,
                languageId: languageId,
                languageCode: language
            };
            var spec = {
                item: {
                    model: 'Item',
                    params: _params
                }
            };
            var app = this.app;

            checkAuthentication(_params, _params.id);
            this.app.fetch(spec, {
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
                    languageCode: language,
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
                    result.user = user;
                    result.item = item;
                    result.postingSession = result.postingSession.get('postingSession');
                    result.intent = 'edit';
                    result.fields = response.fields;
                    result.errors = params.err;
                    result.category = item.category.parentId;
                    result.subcategory = item.category.id;
                    result.language = languageId;
                    result.languageCode = language;
                    result.errField = params.errField;
                    result.errMsg = params.errMsg;
                    result.sk = securityKey;
                    callback(err, result);
                });
            }
        }
    }
};
