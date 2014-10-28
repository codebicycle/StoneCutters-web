'use strict';

var asynquence = require('asynquence');
var helpers = require('../helpers');

module.exports = function(params, next) {
    if (this.app.session.get('isServer') && this.app.session.get('countries').toJSON) {
        return next();
    }

    var fetch = function(done) {
        this.app.fetch({
            countries: {
                collection: 'Countries'
            }
        }, {
            readFromCache: false
        }, done.errfcb);
    }.bind(this);

    var store = function(done, response) {
        this.app.session.update({
            countries: response.countries
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
