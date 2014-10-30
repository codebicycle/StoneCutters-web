'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var middlewares = require('../middlewares');
var helpers = require('../helpers');
var tracking = require('../modules/tracking');
var config = require('../../shared/config');

module.exports = {
    register: middlewares(register),
    success: middlewares(success),
    login: middlewares(login),
    logout: middlewares(logout),
    myolx: middlewares(myolx),
    myads: middlewares(myads),
    favorites: middlewares(favorites)
};

function register(params, callback) {
    helpers.controllers.control.call(this, params, {
        isForm: true
    }, controller);

    function controller(form) {
        var platform = this.app.session.get('platform');
        var user;

        if (platform === 'wap') {
            return helpers.common.redirect.call(this, '/');
        }
        user = this.app.session.get('user');
        if (user) {
            return helpers.common.redirect.call(this, '/', null, {
                status: 302
            });
        }
        callback(null, {
            form: form,
            agreeTerms: params.agreeTerms,
            tracking: tracking.generateURL.call(this)
        });
    }
}

function success(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        callback(null, {

        });
    }
}

function login(params, callback) {
    helpers.controllers.control.call(this, params, {
        isForm: true
    }, controller);
    function controller(form) {
        var platform = this.app.session.get('platform');
        var user;

        if (platform === 'wap') {
            return helpers.common.redirect.call(this, '/');
        }
        user = this.app.session.get('user');
        if (user) {
            return helpers.common.redirect.call(this, '/', null, {
                status: 302
            });
        }
        callback(null, {
            form: form,
            redirect: params.redirect,
            tracking: tracking.generateURL.call(this)
        });
    }
}

function logout(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        this.app.session.clear('user');
        return helpers.common.redirect.call(this, '/', null, {
            status: 302,
            pushState: false
        });
    }
}

function myolx(params, callback) {
    helpers.controllers.control.call(this, params, controller);
    function controller() {
        var platform = this.app.session.get('platform');
        var user;

        if (platform === 'wap') {
            return helpers.common.redirect.call(this, '/');
        }
        user = this.app.session.get('user');
        if (platform === 'html5' && user) {
            return helpers.common.redirect.call(this, '/', null, {
                status: 302
            });
        }
        if (!user) {
            return helpers.common.redirect.call(this, '/login', null, {
                status: 302
            });
        }
        if (platform == 'desktop' ){
            return helpers.common.redirect.call(this, '/myolx/myadslisting', null, {
                status: 302
            });
        }

        callback(null, {});
    }
}

function myads(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var deleted;
        var _params;
        var user;
        var prepare = function(done) {
            var platform = this.app.session.get('platform');
            if (platform === 'wap') {
                done.abort();
                return helpers.common.redirect.call(this, '/');
            }
            user = this.app.session.get('user');
            if (!user) {
                done.abort();
                return helpers.common.redirect.call(this, '/login', null, {
                    status: 302
                });
            }

            deleted = params.deleted;
            delete params.deleted;
            _params = _.extend({
                token: user.token,
                userId: user.userId,
                location: this.app.session.get('siteLocation'),
                languageCode: this.app.session.get('selectedLanguage'),
                item_type: 'myAds'
            }, params);

            done();
        }.bind(this);
        var findAds = function(done) {
            this.app.fetch({
                myAds: {
                    collection: 'Items',
                    params: _params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var check = function(done, res) {
            if (!res.myAds) {
                return done.fail(null, res);
            }
            done(res.myAds);
        }.bind(this);

        var success = function(_myAds) {
            var myAds = _myAds.toJSON();
            var platform = this.app.session.get('platform');
            _.each(myAds, function processItem(item) {
                item.date.since = helpers.timeAgo(item.date);
            });
            if (platform === 'desktop') {
                callback(null,'users/myolx', {
                    myAdsMetadata: _myAds.metadata,
                    myAds: myAds,
                    deleted: deleted,
                    viewname: 'myads'
                });
            } else {
                callback(null, {
                    myAdsMetadata: _myAds.metadata,
                    myAds: myAds,
                    deleted: deleted
                });
            }
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(prepare)
            .then(findAds)
            .then(check)
            .val(success);
    }
}

function favorites(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller(form) {
        var favorite;
        var _params;
        var user;

        var prepare = function(done) {
            var platform = this.app.session.get('platform');

            if (platform === 'wap') {
                return helpers.common.redirect.call(this, '/');
            }
            user = this.app.session.get('user');
            if (!user) {
                return helpers.common.redirect.call(this, '/login', null, {
                    status: 302
                });
            }

            favorite = params.favorite;
            delete params.favorite;
            _params = _.extend({
                token: user.token,
                userId: user.userId,
                location: this.app.session.get('siteLocation'),
                item_type: 'favorites'
            }, params);

            done();
        }.bind(this);

        var findFavorites = function(done) {
            this.app.fetch({
                favorites: {
                    collection: 'Items',
                    params: _params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var check = function(done, res) {
            if (!res.favorites) {
                return done.fail(null, res);
            }
            done(res.favorites);
        }.bind(this);

        var success = function(_favorites) {
            var favorites = _favorites.toJSON();
            var platform = this.app.session.get('platform');

            _.each(favorites, function processItem(item) {
                item.date.since = helpers.timeAgo(item.date);
            });

            if (platform === 'desktop') {
                callback(null, 'users/myolx', {
                    favoritesMetadata: _favorites.metadata,
                    favorites: favorites,
                    favorite: favorite,
                    viewname: 'favorites'
                });
            } else {
                callback(null, {
                    favoritesMetadata: _favorites.metadata,
                    favorites: favorites,
                    favorite: favorite
                });
            }
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(prepare)
            .then(findFavorites)
            .then(check)
            .val(success);
    }
}
