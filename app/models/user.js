'use strict';

var _ = require('underscore');
var crypto = require('crypto');
var asynquence = require('asynquence');
var Base = require('../bases/model');
var dataAdapter = require('../helpers/dataAdapter');
var statsd = require('../../shared/statsd')();
var utils = require('../../shared/utils');

module.exports = Base.extend({
    url: '/users/:userId/profile',
    parse: parse,
    getUsernameOrEmail: getUsernameOrEmail,
    login: login,
    lostpassword: lostpassword,
    register: register,
    registerConfirm: registerConfirm,
    reply: reply,
    registerWithFacebook: registerWithFacebook,
    authenticateWithFacebook: authenticateWithFacebook,
    edit: edit,
    changePassword: changePassword,
    toData: toData
});

module.exports.id = 'User';

function parse(response) {
    if (response.profile.firstname) {
        response.profile.firstName = response.profile.firstname;
    }
    return response.profile;
}

function getUsernameOrEmail() {
    return this.get('usernameOrEmail') || this.get('username') || this.get('email');
}

function getHash(hash) {
    if (utils.isServer) {
        return crypto.createHash('sha512').update(hash + this.getUsernameOrEmail()).digest('hex');
    }
    return utils.toSha512(hash + this.getUsernameOrEmail());
}

function login(done) {
    asynquence().or(fail.bind(this))
        .then(challenge.bind(this))
        .then(submit.bind(this))
        .then(persist.bind(this))
        .val(success.bind(this));

    function challenge(done) {
        dataAdapter.get(this.app.req, '/users/challenge', {
            query: {
                u: this.getUsernameOrEmail(),
                platform: this.get('platform')
            }
        }, done.errfcb);
    }

    function submit(done, res, data) {
        var hash = this.get('password');

        if (!this.has('noMD5')) {
          hash = crypto.createHash('md5').update(hash || '').digest('hex');
        }
        dataAdapter.get(this.app.req, '/users/login', {
            query: {
                c: data.challenge,
                h: getHash.call(this, hash),
                platform: this.get('platform')
            }
        }, done.errfcb);
    }

    function persist(done, res, user) {
        this.set(user);
        this.app.session.persist({
            user: user
        });
        done();
    }

    function success() {
        if (!this.has('new')) {
            statsd.increment([this.get('country'), 'login', 'success', this.get('platform')]);
        }
        done();
    }

    function fail(err) {
        if (!this.has('new')) {
            statsd.increment([this.get('country'), 'login', 'error', err.statusCode, this.get('platform')]);
        }
        done.fail(err);
    }
}

function lostpassword(done) {
    asynquence().or(fail.bind(this))
        .then(submit.bind(this))
        .val(success.bind(this));

    function submit(done, query) {
        dataAdapter.get(this.app.req, '/users/forgotpassword', {
            query: {
                email: this.get('email'),
                url: this.get('location')
            }
        }, done.errfcb);
    }

    function success() {
        statsd.increment([this.get('country'), 'lostpassword', 'success', this.get('platform')]);
        done();
    }

    function fail(err) {
        statsd.increment([this.get('country'), 'lostpassword', 'error', err.statusCode, this.get('platform')]);
        done.fail(err);
    }
}

function register(done) {
    asynquence().or(fail.bind(this))
        .then(prepare.bind(this))
        .then(submit.bind(this))
        .then(persist.bind(this))
        .val(success.bind(this));

    function prepare(done) {
        var query = {
            platform: this.get('platform')
        };

        if (this.has('withConfirmation')) {
            query.withConfirmation = this.get('withConfirmation');
        }
        done(query);
    }

    function submit(done, query) {
        dataAdapter.post(this.app.req, '/users', {
            query: query,
            data: this.toJSON()
        }, done.errfcb);
    }

    function persist(done, res, user) {
        user = user || {};
        delete user.password;
        this.set(user);
        done();
    }

    function success() {
        statsd.increment([this.get('country'), 'register', 'success', this.get('platform')]);
        done();
    }

    function fail(err) {
        statsd.increment([this.get('country'), 'register', 'error', err.statusCode, this.get('platform')]);
        done.fail(err);
    }
}

function registerConfirm(done) {
    asynquence().or(fail.bind(this))
        .then(submit.bind(this))
        .val(success.bind(this));

    function submit(done) {
        dataAdapter.post(this.app.req, '/users/confirm', {
            query: {
                languageId: this.get('languageId'),
                platform: this.get('platform'),
                username: this.get('username'),
                hash: this.get('hash')
            }
        }, done.errfcb);
    }

    function success(res, body) {
        this.set(body);
        statsd.increment([this.get('country'), 'register','confirm', 'success', this.get('platform')]);
        done();
    }

    function fail(err) {
        statsd.increment([this.get('country'), 'register','confirm', 'error', err.statusCode, this.get('platform')]);
        done.fail(err);
    }
}

function reply(done, data) {
    asynquence().or(fail.bind(this))
        .then(prepare.bind(this))
        .then(submit.bind(this))
        .then(check.bind(this))
        .val(success.bind(this));

    function prepare(done) {
        var query = {
            languageId: this.get('languageId'),
            platform: this.get('platform')
        };

        if (data.token) {
            query.token = data.token;
        }
        _.each(data, function each(value, key) {
            if (!value) {
                delete data[key];
            }
        });
        done(query);
    }

    function submit(done, query) {
        dataAdapter.post(this.app.req, '/items/' + data.id + '/messages', {
            data: data,
            query: query
        }, done.errfcb);
    }

    function check(done, response, body) {
        if (body.id) {
            return done(body);
        }
        body.statusCode = response.statusCode;
        return done.fail(body);
    }

    function success(reply) {
        statsd.increment([this.get('country'), 'reply', 'success', this.get('platform')]);
        done(reply);
    }

    function fail(err) {
        statsd.increment([this.get('country'), 'reply', 'error', err.statusCode, this.get('platform')]);
        done.fail(err);
    }
}

function registerWithFacebook(done) {
    asynquence().or(fail.bind(this))
        .then(submit.bind(this))
        .val(success.bind(this));

    function submit(done) {
        dataAdapter.post(this.app.req, '/users/facebook/register', {
            data: this.toData()
        }, done.errfcb);
    }

    function success(res) {
        statsd.increment([this.get('country'), 'facebookRegister', 'success', this.get('platform')]);
        done(res);
    }

    function fail(err) {
        statsd.increment([this.get('country'), 'facebookRegister', 'error', err.statusCode, this.get('platform')]);
        done.fail(err);
    }
}

function authenticateWithFacebook(done) {
    asynquence().or(fail.bind(this))
        .then(submit.bind(this))
        .then(persist.bind(this))
        .val(success.bind(this));

    function submit(done, query) {
        dataAdapter.get(this.app.req, '/users/facebook/' + this.get('facebookId'), {
            query: {
                facebookToken: this.get('facebookToken')
            }
        }, done.errfcb);
    }

    function persist(done, res, user) {
        this.set(user);
        this.app.session.persist({
            user: user
        });
        done();
    }

    function success() {
        statsd.increment([this.get('country'), 'facebookLogin', 'success', this.get('platform')]);
        done();
    }

    function fail(err) {
        statsd.increment([this.get('country'), 'facebookLogin', 'error', err.statusCode, this.get('platform')]);
        done.fail(err);
    }
}

function edit(done) {
    asynquence().or(fail.bind(this))
        .then(submit.bind(this))
        .val(success.bind(this));

    function submit(done) {
        dataAdapter.post(this.app.req, '/users/' + this.get('userId') + '/profile/' + this.get('intent'), {
            query: {
                platform: this.get('platform'),
                token: this.get('token')
            },
            data: this.toData()
        }, done.errfcb);
    }

    function success(response, profile) {
        console.log(response, profile);
        statsd.increment([this.get('country'), 'profile', this.get('intent'), 'success', this.get('platform')]);
        done();
    }

    function fail(err) {
        statsd.increment([this.get('country'), 'profile', this.get('intent'), 'error', err.statusCode, this.get('platform')]);
        done.fail(err);
    }
}

function changePassword(done) {
    asynquence().or(fail.bind(this))
        .then(submit.bind(this))
        .val(success.bind(this));

    function submit(done) {
        dataAdapter.post(this.app.req, '/users/' + this.get('userId') + '/edit', {
            query: {
                platform: this.get('platform'),
                token: this.get('token')
            },
            data: this.toData()
        }, callback);

        function callback(err, response, body) {
            if (err) {
                body.statusCode = response.statusCode;
                return done.fail(body);
            }
            done(response, body);
        }
    }

    function success(response, profile) {
        statsd.increment([this.get('country'), 'profile', 'password', 'success', this.get('platform')]);
        done();
    }

    function fail(err) {
        statsd.increment([this.get('country'), 'profile', 'password', 'error', err.statusCode, this.get('platform')]);
        done.fail(err);
    }
}

function toData() {
    var data = this.toJSON();

    _.each(data, function each(value, key) {
        if (value === undefined || value === null || value === '') {
            delete data[key];
        }
    });
    delete data.token;
    delete data.intent;
    delete data.favorites;
    delete data.unreadConversationsCount;
    delete data.unreadMessagesCount;
    delete data.agreeTerms;
    delete data.country;
    return data;
}
