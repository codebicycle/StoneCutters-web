'use strict';

var helpers = require('../helpers');

module.exports = {
    index: function(params, callback) {
        var app = helpers.environment.init(this.app);

        callback(null, {
            'params': params,
        });
    },
    subcat: function(params, callback) {
        var app = helpers.environment.init(this.app);

        var subcategories = this.app.getSession('categories')._byId[params.id].children;

        callback(null, {
            'params': params,
            'subcategories': subcategories
        });
    },
    form: function(params, callback) {
        var app = helpers.environment.init(this.app);
        var urlParams = params;

        var languageId = this.app.getSession().selectedLanguage;
        var languangeCode = this.app.getSession('languages')._byId[languageId].isocode;

        var spec = {
                fields: {
                    collection: 'Fields',
                    params: {
                    	intent: 'post',
                    	location: this.app.getSession('siteLocation'),
                    	categoryId: urlParams.id,
                    	languageId: languageId,
                    	languageCode: languangeCode,
                    }
                }
            };

        app.fetch(spec, function afterFetch(err, result) {
        	var response = result.fields.models[0].attributes;
        	result.postingSession = response.postingSession;
        	result.intent = 'create';
        	result.fields = response.fields;
        	result.errors = params.err;
            callback(err, result);
        });

    }
};
