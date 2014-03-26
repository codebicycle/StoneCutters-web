'use strict';

var helpers = require('../helpers');
var _ = require('underscore');

module.exports = {
    index: function(params, callback) {
        var app = helpers.environment.init(this.app);

        callback(null, {
            'params': params,
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
        var spec = {
            fields: {
                collection: 'Fields',
                params: {
                    intent: 'post',
                    location: siteLocation,
                    categoryId: params.subcategoryId,
                    languageId: language
                }
            }
        };

        app.fetch(spec, function afterFetch(err, result) {
            var response = result.fields.models[0].attributes;

            result.postingSession = response.postingSession;
            result.intent = 'create';
            result.fields = response.fields;
            result.errors = params.err;
            result.category = params.categoryId;
            result.subcategory = params.subcategoryId;
            result.location = siteLocation;
            result.language = language;
            result.platform = app.getSession('platform');
            callback(err, result);
        });

    }
};
