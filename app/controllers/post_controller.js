'use strict';

var helpers = require('../helpers');
var _ = require('underscore');

module.exports = {
    index: function(params, callback) {
        var app = helpers.environment.init(this.app);

        callback(null, {
            params: params,
            platform: app.getSession('platform'),
            template: app.getSession('template')
        });
    },
    subcat: function(params, callback) {
        var app = helpers.environment.init(this.app);
        var subcategories = this.app.getSession('categories')._byId[params.categoryId].children;

        callback(null, _.extend(params, {
            'subcategories': subcategories
        }));
    },
    form: function(params, callback) {
        var app = helpers.environment.init(this.app);
        var siteLocation = app.getSession('siteLocation');
        var language = app.getSession('selectedLanguage');
        var languages = app.getSession('languages');
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

        app.fetch(spec, function afterFetch(err, result) {
            var response = result.fields.models[0].attributes;
            result.postingSession = result.postingSession.get('postingSession');
            result.intent = 'create';
            result.fields = response.fields;
            result.errors = params.err;
            result.category = params.categoryId;
            result.subcategory = params.subcategoryId;
            result.location = siteLocation;
            result.language = languageId;
            result.languageCode = language;
            result.platform = app.getSession('platform');
            result.template = app.getSession('template');
            result.errField = params.errField;
            result.errMsg = params.errMsg;
            callback(err, result);
        });
    },
    edit: function(params, callback) {
        var app = helpers.environment.init(this.app);
        var user = app.getSession('user');
        var language = app.getSession('selectedLanguage');
        var languages = app.getSession('languages');
        var languageId = languages._byId[language].id;
        var securityKey = params.sk;

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

        function findItem(next) {
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

            checkAuthentication(_params, _params.id);
            app.fetch(spec, {
                'readFromCache': false
            }, function afterFetch(err, result) {
                if (err) {
                    return callback(err, result);
                }
                next(err, result);
            });
        }

        function findFields(err, response) {
            var item = response.item.toJSON();
            var siteLocation = app.getSession('siteLocation');
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
                result.location = siteLocation;
                result.language = languageId;
                result.languageCode = language;
                result.platform = app.getSession('platform');
                result.template = app.getSession('template');
                result.errField = params.errField;
                result.errMsg = params.errMsg;
                result.sk = securityKey;
                callback(err, result);
            });
        }

        findItem(findFields);
    }
};
