'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var middlewares = require('../middlewares');
var helpers = require('../helpers');
var tracking = require('../modules/tracking');
var config = require('../../shared/config');
var Paginator = require('../modules/paginator');

module.exports = {
    register: middlewares(register),
    success: middlewares(success),
    login: middlewares(login),
    lostpassword: middlewares(lostpassword),
    logout: middlewares(logout),
    myolx: middlewares(myolx),
    myads: middlewares(myads),
    favorites: middlewares(favorites),
    messages: middlewares(messages),
    readmessages: middlewares(readmessages)
};

function register(params, callback) {
    helpers.controllers.control.call(this, params, {
        isForm: true
    }, controller);

    function controller() {
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
            form: this.form,
            agreeTerms: params.agreeTerms
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

function lostpassword(params, callback) {
    helpers.controllers.control.call(this, params, {
        isForm: true
    }, controller);

    function controller() {
        callback(null, {
            form: this.form,
            success: params.success
        });
    }
}

function login(params, callback) {
    helpers.controllers.control.call(this, params, {
        isForm: true
    }, controller);

    function controller() {
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
            form: this.form,
            redirect: params.redirect
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
        if (platform === 'desktop' ){
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
        var page = params ? params.page : undefined;
        var myAds;
        var deleted;
        var _params;
        var user;

        var redirect = function(done) {
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
            done();
        }.bind(this);

        var prepare = function(done) {
            Paginator.prepare(this.app, params);
            myAds = params.myAds;
            deleted = params.deleted;
            delete params.deleted;
            _params = _.extend({}, params, {
                token: user.token,
                userId: user.userId,
                languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id,
                item_type: 'myAds'
            });

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

        var paginate = function(done, myAds) {
            var url = '/myolx/myadslisting';
            var realPage;

            if (page == 1) {
                done.abort();
                return helpers.common.redirect.call(this, url);
            }
            realPage = myAds.paginate([url, '[page]'].join(''), params, {
                page: page
            });
            if (realPage) {
                done.abort();
                return helpers.common.redirect.call(this, [url, '-p-', realPage].join(''));
            }
            done(myAds);
        }.bind(this);

        var success = function(_myAds) {
            var myAds = _myAds.toJSON();
            var platform = this.app.session.get('platform');
            var view = 'users/myads';
            var data = {
                myAdsMetadata: _myAds.meta,
                myAds: myAds,
                deleted: deleted,
                paginator: _myAds.paginator
            };

            if (platform === 'desktop') {
                view = 'users/myolx';
                _.extend(data, {
                    viewname: 'myads'
                });
            }
            callback(null, view, data);
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .then(prepare)
            .then(findAds)
            .then(check)
            .then(paginate)
            .val(success);
    }
}

function favorites(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var page = params ? params.page : undefined;
        var favorite;
        var _params;
        var user;

        var redirect = function(done) {
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
            done();
        }.bind(this);

        var prepare = function(done) {
            Paginator.prepare(this.app, params);
            favorite = params.favorite;
            delete params.favorite;
            _params = _.extend({}, params, {
                token: user.token,
                userId: user.userId,
                languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id,
                item_type: 'favorites'
            });

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

        var paginate = function(done, favorites) {
            var url = '/myolx/favoritelisting';
            var realPage;

            if (page == 1) {
                done.abort();
                return helpers.common.redirect.call(this, url);
            }
            realPage = favorites.paginate([url, '[page]'].join(''), params, {
                page: page
            });
            if (realPage) {
                done.abort();
                return helpers.common.redirect.call(this, [url, '-p-', realPage].join(''));
            }
            done(favorites);
        }.bind(this);

        var success = function(_favorites) {
            var favorites = _favorites.toJSON();
            var platform = this.app.session.get('platform');
            var view = 'users/favorites';
            var data = {
                favoritesMetadata: _favorites.meta,
                favorites: favorites,
                favorite: favorite,
                paginator: _favorites.paginator
            };

            if (platform === 'desktop') {
                view = 'users/myolx';
                _.extend(data, {
                    viewname: 'favorites'
                });
            }
            callback(null, view, data);
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .then(prepare)
            .then(findFavorites)
            .then(check)
            .then(paginate)
            .val(success);
    }
}

function messages(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var page = params ? params.page : undefined;
        var message;
        var _params;
        var user;

        var redirect = function(done) {
            var platform = this.app.session.get('platform');

            if (platform !== 'desktop') {
                return done.fail();
            }
            user = this.app.session.get('user');
            if (!user) {
                return helpers.common.redirect.call(this, '/login', null, {
                    status: 302
                });
            }
            done();
        }.bind(this);

        var prepare = function(done) {
            Paginator.prepare(this.app, params);
            message = params.message;
            delete params.message;
            _params = _.extend({}, params, {
                token: user.token,
                userId: user.userId
            });

            done();
        }.bind(this);

        var fetch = function(done) {
            this.app.fetch({
                messages: {
                    collection: 'Messages',
                    params: _params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var paginate = function(done, res) {
            var url = '/myolx/myolxmessages';
            var realPage;

            if (page == 1) {
                done.abort();
                return helpers.common.redirect.call(this, url);
            }
            realPage = res.messages.paginate([url, '[page]'].join(''), params, {
                page: page
            });
            if (realPage) {
                done.abort();
                return helpers.common.redirect.call(this, [url, '-p-', realPage].join(''));
            }
            done(res);
        }.bind(this);

        var success = function(response) {
            callback(null, 'users/myolx', {
                messages: response.messages.toJSON(),
                viewname: 'messages',
                paginator: response.paginator
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .then(prepare)
            .then(fetch)
            .then(paginate)
            .val(success);
    }
}

function readmessages(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var deleted;
        var _params;
        var user;

        var redirect = function(done) {
            var platform = this.app.session.get('platform');

            if (platform !== 'desktop') {
                return done.fail();
            }
            done();
        }.bind(this);

        var prepare = function(done) {
            user = this.app.session.get('user');
            if (!user) {
                return helpers.common.redirect.call(this, '/login', null, {
                    status: 302
                });
            }

            _params = _.extend({
                token: user.token,
                userId: user.userId,
                messageId: params.msgId
            }, params);

            done();
        }.bind(this);

        var fetch = function(done) {
            this.app.fetch({
                message: {
                    model: 'Message',
                    params: _params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var success = function(response) {
            callback(null, 'users/myolx', {
                message: response.message.toJSON(),
                viewname: 'readmessages'
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(prepare)
            .then(fetch)
            .val(success);
    }
}
