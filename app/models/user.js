'use strict';

var Base = require('../bases/model');
var crypto = require('crypto');
var asynquence = require('asynquence');
var dataAdapter = require('../helpers/dataAdapter');

module.exports = Base.extend({
    url: '/users',
    getUsernameOrEmail: getUsernameOrEmail,
    login: login,
    register: register
});

module.exports.id = 'User';

function getUsernameOrEmail() {
    return this.get('usernameOrEmail') || this.get('username') || this.get('email');
}

function login(done, req) {
    asynquence().or(done.fail)
        .then(challenge.bind(this))
        .then(submit.bind(this))
        .val(persist.bind(this));

    function challenge(done) {
        dataAdapter.get(req, '/users/challenge', {
            query: {
                u: this.getUsernameOrEmail(),
                platform: this.get('platform')
            }
        }, done.errfcb);
    }

    function submit(done, res, data) {
        var hash = crypto.createHash('md5').update(this.get('password') || '').digest('hex');

        dataAdapter.get(req, '/users/login', {
            query: {
                c: data.challenge,
                h: crypto.createHash('sha512').update(hash + this.getUsernameOrEmail()).digest('hex'),
                platform: this.get('platform')
            }
        }, done.errfcb);
    }

    function persist(res, user) {
        this.set(user);
        req.rendrApp.session.persist({
            user: user
        });
        done();
    }
}

function register(done, req) {
    asynquence().or(done.fail)
        .then(submit.bind(this))
        .val(persist.bind(this));

    function submit(done) {
        dataAdapter.post(req, '/users', {
            query: {
                platform: this.get('platform')
            },
            data: this.toJSON()
        }, done.errfcb);
    }

    function persist(res, user) {
        this.set(user);
        done();
    }
}
