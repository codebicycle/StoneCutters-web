'use strict';

var asynquence = require('asynquence');
var helpers = require('../helpers');
var Seo = require('../modules/seo');

module.exports = function(params, next) {
    if (this.app.session.get('isServer') && this.app.session.get('categories').toJSON) {
        return next();
    }
    var seo = Seo.instance(this.app);

    var fetch = function(done) {
        this.app.fetch({
            categories: {
                collection: 'Categories',
                params: {
                    location: this.app.session.get('siteLocation'),
                    languageCode: this.app.session.get('selectedLanguage'),
                    seo: seo.isEnabled()
                }
            }
        }, {
            readFromCache: false
        }, done.errfcb);
    }.bind(this);

    var store = function(done, response) {
        this.app.session.update({
            categories: response.categories
        });
        done();
    }.bind(this);

    var fail = function(err) {
        this.app.session.persist({
            error: err
        });
        next.abort();
        return helpers.common.redirect.call(this, '/500');
    }.bind(this);

    asynquence().or(fail)
        .then(fetch)
        .then(store)
        .val(next);
};
