'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var middlewares = require('../middlewares');
var helpers = require('../helpers');
var config = require('../../shared/config');
var Item = require('../models/item');
var Adapter = require('../../shared/adapters/base');

module.exports = {
    didyousell: middlewares(didyousell),
    mobilepromo: middlewares(mobilepromo),
    republish: middlewares(republish),
    asyncseller: middlewares(asyncseller),
    asyncbuyer: middlewares(asyncbuyer),
    available: middlewares(available)
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

function asyncseller(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var adapter = new Adapter({});
        var languages = this.app.session.get('languages');

        asynquence().or(error.bind(this))
            .then(redirect.bind(this))
            .then(prepare.bind(this))
            .then(fetchTransaction.bind(this))
            .then(checkTransaction.bind(this))
            .then(fetch.bind(this))
            .then(check.bind(this))
            .val(success.bind(this));

        function redirect(done) {
            var platform = this.app.session.get('platform');

            if (platform === 'wap' || !params.itemId || !params.email) {
                done.abort();
                return helpers.common.redirect.call(this, '/');
            }
            done();
        }

        function prepare(done) {
            params.id = params.itemId;
            delete params.itemId;
            done({
                itemId: params.id
            });
        }

        function fetchTransaction(done, data) {
            adapter.request(this.app.req, {
                method: 'POST',
                url: [config.get(['mario', 'protocol']), '://', config.get(['mario', 'host']), '/async-pickup/validate'].join(''),
                data: JSON.stringify(data)
            }, {
                timeout: 2000
            }, done.errfcb);
        }

        function checkTransaction(done, response, body) {
            body = JSON.parse(body);
            if (!body.status && body.error.length) {
                return done(body.error[0].key, body.error[0].message);
            }
            done();
        }

        function fetch(done, key, message) {
            this.app.fetch({
                item: {
                    model: 'Item',
                    params: params
                }
            }, {
                readFromCache: false
            }, function afterFetch(err, res) {
                if (!res) {
                    res = {};
                }
                if (err || !res.item.get('status').open) {
                    done.abort();
                    return helpers.common.redirect.call(this, '/');
                }
                done(res, key, message);
            }.bind(this));
        }

        function check(done, response, key, message) {
            if (!response.item) {
                done.abort();
                return helpers.common.redirect.call(this, '/');
            }
            done(response.item, key, message);
        }

        function success(_item, key, message) {
            var item = _item.toJSON();

            callback(null, {
                sellerEmail: params.email,
                item: item,
                key: key,
                message: message
            });
        }

        function error(err, res) {
            return helpers.common.redirect.call(this, '/');
        }
    }
}

function asyncbuyer(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var adapter = new Adapter({});

        asynquence().or(error.bind(this))
            .then(redirect.bind(this))
            .then(fetchTransaction.bind(this))
            .then(checkTransaction.bind(this))
            .val(success.bind(this));

        function redirect(done) {
            var platform = this.app.session.get('platform');

            if (platform === 'wap' || !params.transactionId || !params.itemId) {
                done.abort();
                return helpers.common.redirect.call(this, '/');
            }
            done();
        }

        function fetchTransaction(done) {
            adapter.request(this.app.req, {
                method: 'GET',
                url: [config.get(['mario', 'protocol']), '://', config.get(['mario', 'host']), '/async-pickup/transaction/id/', params.transactionId ].join(''),
            }, {
                timeout: 2000
            }, done.errfcb);
        }

        function checkTransaction(done, response, body) {
            body = JSON.parse(body);

            if (!body.status && body.error.length) {
                done.abort();
                return helpers.common.redirect.call(this, '/', null, {
                    status: 302
                });
            }
            done(body.extra.transaction.hasBuyerData, body.extra.transaction.seller);
        }

        function success(hasBuyerData, sellerName) {
            callback(null, {
                hasBuyerData: hasBuyerData,
                transactionId: params.transactionId,
                itemId: params.itemId,
                sellerName: sellerName,
            });
        }

        function error(err, res) {
            return helpers.common.redirect.call(this, '/');
        }
    }
}

function available(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var platform = this.app.session.get('platform');
        var item;

        asynquence().or(fail.bind(this))
            .then(redirect.bind(this))
            .then(prepare.bind(this))
            .then(stillAvailable.bind(this))
            .val(success.bind(this));

        function redirect(done) {
            if (platform === 'wap') {
                done.abort();
                return helpers.common.redirect.call(this, '/');
            }
            done();
        }

        function prepare(done) {
            item = new Item({
                id: params.itemId
            }, {
                app: this.app
            });
            done();
        }

        function stillAvailable(done) {
            item.stillAvailable(done);
        }

        function success(res, body) {
            callback(null, {});
        }

        function fail(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }


    }
}

