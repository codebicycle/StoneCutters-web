'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var middlewares = require('../middlewares');
var helpers = require('../helpers');

module.exports = {
    ads: middlewares(ads),
    listings: middlewares(listings),
    purchase: middlewares(purchase)
};

function ads(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var result = params.fa_status === 'ok' ? true : false;
        var securityKey = params.sk;
        var id = params.id;
        var item;

        var redirect = function(done) {
            var platform = this.app.session.get('platform');

            if (platform !== 'desktop') {
                return done.fail();
            }
            done();
        }.bind(this);

        var prepare = function(done) {
            var user = this.app.session.get('user');
            var languages = this.app.session.get('languages');
            var params = {
                id: id
            };
            var anonymousItem;

            if (user) {
                params.token = user.token;
            }
            else if (typeof window !== 'undefined' && localStorage) {
                anonymousItem = localStorage.getItem('anonymousItem');
                anonymousItem = (!anonymousItem ? {} : JSON.parse(anonymousItem));
                if (securityKey) {
                    anonymousItem[params.id] = securityKey;
                    localStorage.setItem('anonymousItem', JSON.stringify(anonymousItem));
                }
            }
            params.languageId = languages._byId[this.app.session.get('selectedLanguage')].id;
            done(params);
        }.bind(this);

        var fetch = function(done, params) {
            this.app.fetch({
                item: {
                    model: 'Item',
                    params: params
                }
            }, {
                readFromCache: false
            }, this.errfcb(done));
        }.bind(this);

        var check = function(done, res) {
            if (!res.item) {
                return done.fail(null, {});
            }
            done(res.item);
        }.bind(this);

        var success = function(item) {
            callback(null, {
                item: item.toJSON(),
                result: result
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .then(prepare)
            .then(fetch)
            .then(check)
            .val(success);
    }
}

function listings(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var redirect = function(done) {
            var platform = this.app.session.get('platform');

            if (platform !== 'desktop') {
                return done.fail();
            }
            done();
        }.bind(this);

        var success = function() {
            callback(null, {});
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .val(success);
    }
}

function purchase(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var securityKey = params.sk;
        var id = params.id;
        var item;

        var redirect = function(done) {
            var platform = this.app.session.get('platform');

            if (platform !== 'desktop') {
                return done.fail();
            }
            done();
        }.bind(this);

        var prepare = function(done) {
            var user = this.app.session.get('user');
            var languages = this.app.session.get('languages');
            var params = {
                id: id
            };
            var anonymousItem;

            if (user) {
                params.token = user.token;
            }
            else if (typeof window !== 'undefined' && localStorage) {
                anonymousItem = localStorage.getItem('anonymousItem');
                anonymousItem = (!anonymousItem ? {} : JSON.parse(anonymousItem));
                if (securityKey) {
                    anonymousItem[params.id] = securityKey;
                    localStorage.setItem('anonymousItem', JSON.stringify(anonymousItem));
                }
            }
            params.languageId = languages._byId[this.app.session.get('selectedLanguage')].id;
            done(params);
        }.bind(this);

        var fetch = function(done, params) {
            this.app.fetch({
                item: {
                    model: 'Item',
                    params: params
                }
            }, {
                readFromCache: false
            }, this.errfcb(done));
        }.bind(this);

        var check = function(done, res) {
            if (!res.item) {
                return done.fail(null, {});
            }
            done(res.item);
        }.bind(this);

        var findFeatureAds = function(done, item) {
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
                done(item, res.featuread);
            }.bind(this));
        }.bind(this);

        var success = function(item, featureAd) {
            callback(null, {
                item: item.toJSON(),
                featureAd: featureAd
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .then(prepare)
            .then(fetch)
            .then(check)
            .then(findFeatureAds)
            .val(success);
    }
}
