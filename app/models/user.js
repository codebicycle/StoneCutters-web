'use strict';

var Base = require('../bases/model');
var crypto = require('crypto');
var asynquence = require('asynquence');
var dataAdapter = require('../helpers/dataAdapter');
var statsd = require('../../shared/statsd')();

module.exports = Base.extend({
    url: '/users',
    getUsernameOrEmail: getUsernameOrEmail,
    login: login,
    register: register,
    reply: reply
});

module.exports.id = 'User';

function checkResponse(res) {
    if (!res || !res.statusCode) {
        res = {
            statusCode: '599'
        };
    }
    return res;
}

function getUsernameOrEmail() {
    return this.get('usernameOrEmail') || this.get('username') || this.get('email');
}

function login(done, req) {
    var challenge = function(done) {
        dataAdapter.get(req, '/users/challenge', {
            query: {
                u: this.getUsernameOrEmail(),
                platform: this.get('platform')
            }
        }, done.errfcb);
    }.bind(this);

    var submit = function(done, res, data) {
        var hash = crypto.createHash('md5').update(this.get('password') || '').digest('hex');

        dataAdapter.get(req, '/users/login', {
            query: {
                c: data.challenge,
                h: crypto.createHash('sha512').update(hash + this.getUsernameOrEmail()).digest('hex'),
                platform: this.get('platform')
            }
        }, done.errfcb);
    }.bind(this);

    var persist = function(done, res, user) {
        this.set(user);
        req.rendrApp.session.persist({
            user: user
        });
        done();
    }.bind(this);

    var success = function(res) {
        if (!this.has('new')) {
            statsd.increment([this.get('country'), 'login', 'success', this.get('platform')]);
        }
        done();
    }.bind(this);

    var error = function(err, res) {
        if (!this.has('new')) {
            statsd.increment([this.get('country'), 'login', 'error', checkResponse(res).statusCode, this.get('platform')]);
        }
        done.fail(err);
    }.bind(this);

    asynquence().or(error)
        .then(challenge)
        .then(submit)
        .then(persist)
        .val(success);
}

function register(done, req) {
    var submit = function(done) {
        dataAdapter.post(req, '/users', {
            query: {
                platform: this.get('platform')
            },
            data: this.toJSON()
        }, done.errfcb);
    }.bind(this);

    var persist = function(done, res, user) {
        delete user.password;
        this.set(user);
        done();
    }.bind(this);

    var success = function(res) {
        statsd.increment([this.get('country'), 'register', 'success', this.get('platform')]);
        done();
    }.bind(this);

    var error = function(err, res) {
        statsd.increment([this.get('country'), 'register', 'error', checkResponse(res).statusCode, this.get('platform')]);
        done.fail(err);
    }.bind(this);

    asynquence().or(error)
        .then(submit)
        .then(persist)
        .val(success);
}

function reply(done, req, data) {
    var prepare = function(done) {
        var query = {
            languageId: this.get('languageId'),
            platform: this.get('platform')
        };

        if (data.token) {
            query.token = data.token;
        }
        done(query);
    }.bind(this);

    var submit = function(done, query) {
        dataAdapter.post(req, '/items/' + data.id + '/messages', {
            data: data,
            query: query
        }, done.errfcb);
    }.bind(this);

    var success = function(res, reply) {
        statsd.increment([this.get('country'), 'reply', 'success', this.get('platform')]);
        done(reply);
    }.bind(this);

    var error = function(err, res) {
        statsd.increment([this.get('country'), 'reply', 'error', checkResponse(res).statusCode, this.get('platform')]);
        done.fail(err);
    }.bind(this);

    asynquence().or(error)
        .then(prepare)
        .then(submit)
        .val(success);
}
