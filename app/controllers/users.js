'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var middlewares = require('../middlewares');
var helpers = require('../helpers');
var Paginator = require('../modules/paginator');
var User = require('../models/user');
var Conversation = require('../models/conversation');
var FeatureAd = require('../models/feature_ad');
var config = require('../../shared/config');

module.exports = {
    register: middlewares(register),
    registersuccess: middlewares(registersuccess),
    login: middlewares(login),
    lostpassword: middlewares(lostpassword),
    logout: middlewares(logout),
    myolx: middlewares(myolx),
    myads: middlewares(myads),
    favorites: middlewares(favorites),
    messages: middlewares(messages),
    readmessages: middlewares(readmessages),
    conversations: middlewares(conversations),
    conversation: middlewares(conversation),
    unsubscribe: middlewares(unsubscribe),
    report: middlewares(report),
    editpersonalinfo: middlewares(editpersonalinfo)
    /*configuration: middlewares(configuration),
    userprofile: middlewares(userprofile),
    createuserprofile: middlewares(createuserprofile),
    edituserprofile: middlewares(edituserprofile),
    emailsnotification: middlewares(emailsnotification)*/
};

function register(params, callback) {
    helpers.controllers.control.call(this, params, {
        isForm: true
    }, controller);

    function controller() {
        var platform = this.app.session.get('platform');
        var user;

        asynquence().or(fail.bind(this))
            .then(redirect.bind(this))
            .then(registerConfirm.bind(this))
            .val(success.bind(this));

        function redirect(done) {
            if (platform === 'wap') {
                done.abort();
                return helpers.common.redirect.call(this, '/');
            }
            if (this.app.session.get('user')) {
                done.abort();
                return helpers.common.redirect.call(this, '/', null, {
                    status: 302
                });
            }
            done();
        }

        function registerConfirm(done) {
            if (!params.hash || !params.username) {
                return done();
            }
            user = new User({
                languageId: this.app.session.get('languageId'),
                country: this.app.session.get('location').name,
                username: params.username,
                hash: params.hash,
                platform: platform,
                noMD5: true
            }, {
                app: this.app
            });
            user.registerConfirm(confirmed);

            function confirmed(err) {
                if (err) {
                    return done();
                }
                user.login(done);
            }
        }

        function success() {
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

        function fail(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }
    }
}

function registersuccess(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        this.app.seo.addMetatag('robots', 'noindex, nofollow');
        this.app.seo.addMetatag('googlebot', 'noindex, nofollow');
        callback(null, 'users/success', {

        });
    }
}

function lostpassword(params, callback) {
    helpers.controllers.control.call(this, params, {
        isForm: true
    }, controller);

    function controller() {
        var platform = this.app.session.get('platform');

        if (platform !== 'desktop' && platform !== 'html5') {
            return helpers.common.redirect.call(this, '/', null, {
               status: 302
           });
        }
        if (platform === 'html5' && params.success) {
            return helpers.common.redirect.call(this, '/login', {
                sent: true
            }, {
                status: 302
            });
        }

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
            redirect: params.redirect,
            sent: params.sent
        });
    }
}

function logout(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        this.app.seo.addMetatag('robots', 'noindex, nofollow');
        this.app.seo.addMetatag('googlebot', 'noindex, nofollow');
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

        this.app.seo.addMetatag('robots', 'noindex, nofollow');
        this.app.seo.addMetatag('googlebot', 'noindex, nofollow');
        callback(null, {});
    }
}

function myads(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var platform = this.app.session.get('platform');
        var user = this.app.session.get('user');
        var page = params.page;
        var deleted = params.deleted;

        delete params.deleted;
        asynquence().or(fail.bind(this))
            .then(redirect.bind(this))
            .then(prepare.bind(this))
            .then(fetch.bind(this))
            .then(paginate.bind(this))
            .then(fetchFeatured.bind(this))
            .val(success.bind(this));

        function redirect(done) {
            if (platform === 'wap') {
                return helpers.common.redirect.call(this, '/');
            }
            if (!user) {
                return helpers.common.redirect.call(this, '/login', null, {
                    status: 302
                });
            }
            done();
        }

        function prepare(done) {
            Paginator.prepare(this.app, params, 'myAds');
            done();
        }

        function fetch(done) {
            this.app.fetch({
                items: {
                    collection: 'Items',
                    params: _.extend({}, params, {
                        token: user.token,
                        userId: user.userId,
                        languageId: this.app.session.get('languageId'),
                        item_type: 'myAds'
                    })
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }

        function paginate(done, response) {
            var url = '/myolx/myadslisting';
            var realPage;

            if (page == 1) {
                done.abort();
                return helpers.common.redirect.call(this, url);
            }
            realPage = response.items.paginate([url, '[page]'].join(''), params, {
                page: page
            });
            if (realPage) {
                done.abort();
                return helpers.common.redirect.call(this, [url, '-p-', realPage].join(''));
            }
            done(response.items);
        }

        function fetchFeatured(done, items) {
            if (!FeatureAd.isEnabled(this.app)) {
                return done(items);
            }
            var promise = asynquence().or(done.fail);

            items.each(function eachItem(item) {
                promise.then(function getFeatured(next) {
                    if (item.has('location') && !FeatureAd.isLocationEnabled(item.get('location').url)) {
                        return done(items);
                    }
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
                        item.set('featured', res.featuread);
                        next();
                    }.bind(this));
                }.bind(this));
            }, this);
            promise.val(function fetchSuccess() {
                done(items);
            });
        }

        function success(items) {
            var location = this.app.session.get('location');
            var isRenewEnabled = config.getForMarket(location.url, ['ads', 'renew', 'enabled'],false);
            var isRebumpEnabled = config.getForMarket(location.url, ['ads', 'rebump', 'enabled'],false);
            var view = 'users/myads';
            var data = {
                include: ['items'],
                items: items,
                deleted: deleted,
                paginator: items.paginator,
                isRenewEnabled: isRenewEnabled,
                isRebumpEnabled: isRebumpEnabled
            };

            if (platform === 'desktop') {
                view = 'users/myolx';
                _.extend(data, {
                    viewname: 'myads'
                });
            }
            this.app.seo.addMetatag('robots', 'noindex, nofollow');
            this.app.seo.addMetatag('googlebot', 'noindex, nofollow');
            callback(null, view, data);
        }

        function fail(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }
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
            Paginator.prepare(this.app, params, 'myFavs');
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

        this.app.seo.addMetatag('robots', 'noindex, nofollow');
        this.app.seo.addMetatag('googlebot', 'noindex, nofollow');

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
        var platform = this.app.session.get('platform');
        var location = this.app.session.get('location');
        var isHermesEnable = helpers.features.isEnabled('hermes', platform, location.url);
        var page = params ? params.page : undefined;
        var message;
        var _params;
        var user;

        var redirect = function(done) {
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
            Paginator.prepare(this.app, params, 'myMsgs');
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
                paginator: response.messages.paginator
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        this.app.seo.addMetatag('robots', 'noindex, nofollow');
        this.app.seo.addMetatag('googlebot', 'noindex, nofollow');

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

        this.app.seo.addMetatag('robots', 'noindex, nofollow');
        this.app.seo.addMetatag('googlebot', 'noindex, nofollow');

        asynquence().or(error)
            .then(prepare)
            .then(fetch)
            .val(success);
    }
}

function conversations(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var platform = this.app.session.get('platform');
        var location = this.app.session.get('location');
        var languages = this.app.session.get('languages');
        var page = params ? params.page : undefined;
        var conversation;
        var _params;
        var user;
        var view = 'users/conversations';

        var redirect = function(done) {
            if (platform === 'wap') {
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
            Paginator.prepare(this.app, params, 'myConvs');
            conversation = params.conversation;
            params.location = location.url;
            params.languageId = languages._byId[this.app.session.get('selectedLanguage')].id;
            delete params.conversation;
            _params = _.extend({}, params, {
                token: user.token,
                userId: user.userId
            });

            done();
        }.bind(this);

        var fetch = function(done) {
            this.app.fetch({
                conversations: {
                    collection: 'Conversations',
                    params: _params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var paginate = function(done, res) {
            var url = 'myolx/conversations';
            var realPage;

            if (page == 1) {
                done.abort();
                return helpers.common.redirect.call(this, url);
            }
            realPage = res.conversations.paginate([url, '[page]'].join(''), params, {
                page: page
            });
            if (realPage) {
                done.abort();
                return helpers.common.redirect.call(this, [url, '-p-', realPage].join(''));
            }
            done(res);
        }.bind(this);

        var success = function(response) {
            this.app.seo.addMetatag('robots', 'noindex, nofollow');
            this.app.seo.addMetatag('googlebot', 'noindex, nofollow');

            if (platform === 'desktop') {
                view = 'users/myolx';
            }
            callback(null, view, {
                include: ['conversations', 'items'],
                conversations: response.conversations.toJSON(),
                items: response.conversations.items,
                viewname: 'conversations',
                paginator: response.conversations.paginator
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

function conversation(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var platform = this.app.session.get('platform');
        var location = this.app.session.get('location');
        var languages = this.app.session.get('languages');
        var page = params ? params.page : undefined;
        var thread;
        var _params;
        var user;
        var view = 'users/conversation';
        var pageSize = 'myConv';

        var redirect = function(done) {
            if (platform === 'wap') {
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
            Paginator.prepare(this.app, params, pageSize);
            thread = params.thread;
            params.location = location.url;
            params.languageId = languages._byId[this.app.session.get('selectedLanguage')].id;
            delete params.thread;
            _params = _.extend({}, params, {
                token: user.token,
                userId: user.userId
            });
            done();
        }.bind(this);

        var fetch = function(done) {
            this.app.fetch({
                thread: {
                    model: 'Conversation',
                    params: _params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var paginate = function(done, res) {
            var url = 'myolx/conversation/' + _params.threadId;
            var realPage;

            if (page == 1) {
                done.abort();
                return helpers.common.redirect.call(this, url);
            }
            realPage = res.thread.paginate([url, '[page]'].join(''), params, {
                page: page
            });
            if (realPage) {
                done.abort();
                return helpers.common.redirect.call(this, [url, '-p-', realPage].join(''));
            }
            done(res);
        }.bind(this);

        var success = function(response) {
            this.app.seo.addMetatag('robots', 'noindex, nofollow');
            this.app.seo.addMetatag('googlebot', 'noindex, nofollow');

            if (platform === 'desktop') {
                view = 'users/myolx';
            }

            callback(null, view, {
                thread: response.thread,
                include: ['thread'],
                viewname: 'conversation',
                paginator: response.thread.paginator
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

function report(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var conversation;

        var prepare = function(done) {
            conversation = new Conversation({
                hash: params.hash
            }, {
                app: this.app
            });
            done();
        }.bind(this);

        var fetch = function(done,err) {
            conversation.report(done);
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        var success = function() {
            callback(null, {});
        }.bind(this);

        asynquence().or(error)
            .then(prepare)
            .then(fetch)
            .val(success);
    }
}

function unsubscribe(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var conversation;

        var prepare = function(done) {
            conversation = new Conversation({
                hash: params.hash
            }, {
                app: this.app
            });
            done();
        }.bind(this);

        var fetch = function(done,err) {
            conversation.unsubscribe(done);
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        var success = function() {
            callback(null, {});
        }.bind(this);

        asynquence().or(error)
            .then(prepare)
            .then(fetch)
            .val(success);
    }
}

function editpersonalinfo(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        if (this.app.session.get('platform') !== 'desktop') {
            return helpers.common.redirect.call(this, '/');
        }
        if (!this.app.session.get('user')) {
            return helpers.common.redirect.call(this, '/login', null, {
                status: 302
            });
        }
        callback(null, 'users/myolx', {
            include: ['profile'],
            profile: _.extend({
                country: this.app.session.get('location').abbreviation,
                location: this.app.session.get('location').url
            }, this.app.session.get('user')),
            viewname: 'editpersonalinfo'
        });
    }
}

/*function configuration(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var user = this.app.session.get('user');

        asynquence().or(error.bind(this))
            .then(redirect.bind(this))
            .then(fetch.bind(this))
            .val(success.bind(this));

        function redirect(done) {
            if (this.app.session.get('platform') !== 'desktop') {
                done.abort();
                return helpers.common.redirect.call(this, '/');
            }
            if (!user) {
                done.abort();
                return helpers.common.redirect.call(this, '/login', null, {
                    status: 302
                });
            }
            done();
        }

        function fetch(done) {
            this.app.fetch({
                profile: {
                    model: 'User',
                    params: {
                        token: user.token,
                        userId: user.userId
                    }
                }
            }, {
                readFromCache: false
            }, after.bind(this));

            function after(err, response) {
                if (err) {
                    if (err.status !== 400) {
                        return done.fail(err);
                    }
                    done.abort();
                    return helpers.common.redirect.call(this, '/myolx/createuserprofile', null, {
                        status: 302
                    });
                }
                done(response);
            }
        }

        function success(response) {
            callback(null, 'users/myolx', {
                profile: response.profile,
                viewname: 'configuration'
            });
        }

        function error(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }
    }
}

function userprofile(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var user = this.app.session.get('user');

        asynquence().or(error.bind(this))
            .then(redirect.bind(this))
            .gate(fetchProfile.bind(this), fetchItems.bind(this))
            .val(success.bind(this));

        function redirect(done) {
            if (this.app.session.get('platform') !== 'desktop') {
                done.abort();
                return helpers.common.redirect.call(this, '/');
            }
            if (!user) {
                done.abort();
                return helpers.common.redirect.call(this, '/login', null, {
                    status: 302
                });
            }
            if (user.username !== params.username) {
                done.abort();
                return helpers.common.redirect.call(this, '/', null, {
                    status: 302
                });
            }
            done();
        }

        function fetchProfile(done) {
            this.app.fetch({
                profile: {
                    model: 'User',
                    params: {
                        token: user.token,
                        userId: user.userId
                    }
                }
            }, {
                readFromCache: false
            }, after.bind(this));

            function after(err, response) {
                if (err) {
                    if (err.status !== 400) {
                        return done.fail(err);
                    }
                    done.abort();
                    return helpers.common.redirect.call(this, '/myolx/createuserprofile', null, {
                        status: 302
                    });
                }
                done(response);
            }
        }

        function fetchItems(done) {
            this.app.fetch({
                items: {
                    collection: 'Items',
                    params: {
                        token: user.token,
                        userId: user.userId,
                        languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id,
                        item_type: 'myAds',
                        pageSize: 0
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }

        function success(response1, response2) {
            callback(null, 'users/myolx', {
                profile: response1.profile,
                items: response2.items,
                viewname: 'userprofile'
            });
        }

        function error(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }
    }
}

function createuserprofile(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var platform = this.app.session.get('platform');
        var user = this.app.session.get('user');

        asynquence().or(error.bind(this))
            .then(redirect.bind(this))
            .then(fetch.bind(this))
            .then(set.bind(this))
            .val(success.bind(this));

        function redirect(done) {
            if (platform !== 'desktop') {
                done.abort();
                return helpers.common.redirect.call(this, '/');
            }
            if (!user) {
                done.abort();
                return helpers.common.redirect.call(this, '/login', null, {
                    status: 302
                });
            }
            done();
        }

        function fetch(done) {
            this.app.fetch({
                profile: {
                    model: 'User',
                    params: {
                        token: user.token,
                        userId: user.userId
                    }
                }
            }, {
                readFromCache: false
            }, after.bind(this));

            function after(err, response) {
                if (!err) {
                    done.abort();
                    return helpers.common.redirect.call(this, '/myolx/edituserprofile', null, {
                        status: 302
                    });
                }
                if (err.status !== 400) {
                    return done.fail(err);
                }
                done(new User(user, {
                    app: this.app
                }));
            }
        }

        function set(done, profile) {
            var location = this.app.session.get('location');
            var state = location.children[0] || {
                children: []
            };
            var city = state.children[0] || {};

            profile.set('location', location.url);
            profile.set('countryId', location.id);
            if (state.id) {
                profile.set('location', state.url);
                profile.set('stateId', state.id);
            }
            if (city.id) {
                profile.set('location', city.url);
                profile.set('cityId', city.id);
            }
            profile
                .set('platform', platform)
                .set('languageId', this.app.session.get('languageId'))
                .set('intent', 'create');
            done(profile);
        }

        function success(profile) {
            callback(null, 'users/myolx', {
                include: ['profile', 'states'],
                profile: profile,
                viewname: 'edituserprofile'
            });
        }

        function error(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }
    }
}

function edituserprofile(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var user = this.app.session.get('user');

        asynquence().or(error.bind(this))
            .then(redirect.bind(this))
            .then(fetch.bind(this))
            .val(success.bind(this));

        function redirect(done) {
            if (this.app.session.get('platform') !== 'desktop') {
                done.abort();
                return helpers.common.redirect.call(this, '/');
            }
            if (!user) {
                done.abort();
                return helpers.common.redirect.call(this, '/login', null, {
                    status: 302
                });
            }
            done();
        }

        function fetch(done) {
            this.app.fetch({
                profile: {
                    model: 'User',
                    params: {
                        token: user.token,
                        userId: user.userId
                    }
                }
            }, {
                readFromCache: false
            }, after.bind(this));

            function after(err, response) {
                if (!err) {
                    return done(response.profile);
                }
                if (err.status !== 400) {
                    return done.fail(err);
                }
                done.abort();
                return helpers.common.redirect.call(this, '/myolx/createuserprofile', null, {
                    status: 302
                });
            }
        }

        function success(profile) {
            callback(null, 'users/myolx', {
                include: ['profile'],
                profile: profile,
                viewname: 'edituserprofile'
            });
        }

        function error(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }
    }
}

function emailsnotification(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var user = this.app.session.get('user');

        asynquence().or(error.bind(this))
            .then(redirect.bind(this))
            .then(fetch.bind(this))
            .val(success.bind(this));

        function redirect(done) {
            if (this.app.session.get('platform') !== 'desktop') {
                done.abort();
                return helpers.common.redirect.call(this, '/');
            }
            if (!user) {
                done.abort();
                return helpers.common.redirect.call(this, '/login', null, {
                    status: 302
                });
            }
            done();
        }

        function fetch(done) {
            this.app.fetch({
                profile: {
                    model: 'User',
                    params: {
                        token: user.token,
                        userId: user.userId
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }

        function success(response) {
            callback(null, 'users/myolx', {
                profile: response.profile.toJSON(),
                viewname: 'emailsnotification'
            });
        }

        function error(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }
    }
}*/
