'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var middlewares = require('../middlewares');
var helpers = require('../helpers');
var config = require('../../shared/config');
var Item = require('../models/item');

module.exports = {
    didyousell: middlewares(didyousell),
    mobilepromo: middlewares(mobilepromo),
    republish: middlewares(republish)
};

function didyousell(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var user = this.app.session.get('user');
        var securityKey = params.sk;
        var itemId = params.itemid;
        var languages = this.app.session.get('languages');
        var platform = this.app.session.get('platform');
        var newItemPage = helpers.features.isEnabled.call(this, 'newItemPage');
        var itemDelete = params.answer;
        var anonymousItem;

        var redirect = function(done) {
            if (platform === 'wap') {
                done.abort();
                return helpers.common.redirect.call(this, '/');
            }
            done();
        }.bind(this);

        var deleteItem = function(done) {
            if (itemDelete !== 'yes') {
                return done();
            }
            helpers.dataAdapter.post(this.app.req, '/items/' + itemId + '/delete', {
                query: {
                    securityKey: securityKey,
                    reason: 2
                },
                cache: false
            }, done.errfcb);
        }.bind(this);

        var prepare = function(done) {
            if (user) {
                params.token = user.token;
            }
            else if (typeof window !== 'undefined' && localStorage) {
                anonymousItem = localStorage.getItem('anonymousItem');
                anonymousItem = (!anonymousItem ? {} : JSON.parse(anonymousItem));
                if (securityKey) {
                    anonymousItem[itemId] = securityKey;
                    localStorage.setItem('anonymousItem', JSON.stringify(anonymousItem));
                }
                else {
                    securityKey = anonymousItem[itemId];
                }
            }
            params.id = itemId;
            params.seo = this.app.seo.isEnabled();
            params.languageId = languages._byId[this.app.session.get('selectedLanguage')].id;
            delete params.itemId;
            delete params.title;
            delete params.sk;
            done();
        }.bind(this);

        var fetch = function(done) {
            this.app.fetch({
                item: {
                    model: 'Item',
                    params: params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var success = function(res, body) {
            var item = res.item;

            callback(null, {
                include: ['item'],
                item: item.toJSON(),
                sk: securityKey,
                answer: params.answer,
                sent: params.sent,
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .then(deleteItem)
            .then(prepare)
            .then(fetch)
            .val(success);
    }
}

function mobilepromo(params, callback) {
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
            return helpers.common.redirect.call(this, '/');
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .val(success);
    }
}

function republish(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        callback(null, {});
    }
}

