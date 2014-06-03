'use strict';

module.exports = function(app, dataAdapter) {
    var _ = require('underscore');
    var asynquence = require('asynquence');
    var formidable = require('../formidable');
    var querystring = require('querystring');
    var crypto = require('crypto');
    var utils = require('../utils');

    var loginHandler = (function login() {

        return function handler(req, res, data) {
            var usernameOrEmail = data.usernameOrEmail;
            var password = data.password;
            var redirect = data.redirect;

            function getChallenge(done) {
                dataAdapter.get(req, '/users/challenge', {
                    query: {
                        u: usernameOrEmail
                    }
                }, done.errfcb);
            }

            function getCredentials(done, response, data) {
                var hash = crypto.createHash('md5').update(password).digest('hex');

                done({
                    c: data.challenge,
                    h: crypto.createHash('sha512').update(hash + usernameOrEmail).digest('hex')
                });
            }

            function submit(done, credentials) {
                dataAdapter.get(req, '/users/login', {
                    query: credentials
                }, done.errfcb);
            }

            function save(done, response, user) {
                req.rendrApp.persistSession({
                    user: user
                });
                done();
            }

            function success() {
                res.redirect(301, utils.link(redirect, req.rendrApp.getSession('siteLocation')));
            }

            function error(err) {
                formidable.error(req, '/login', err, function redirect(url) {
                    res.redirect(301, utils.link(url, req.rendrApp.getSession('siteLocation')));
                });
            }

            asynquence().or(error)
                .then(getChallenge)
                .then(getCredentials)
                .then(submit)
                .then(save)
                .val(success);
        };
    })();

    (function registration() {
        app.post('/register', handler);

        function handler(req, res) {
            var user;

            function parse(done) {
                formidable.parse(req, done.errfcb);
            }

            function submit(done, data) {
                data.location = req.rendrApp.getSession('siteLocation');
                data.languageId = 10;
                dataAdapter.post(req, '/users', {
                    data: data
                }, done.errfcb);
            }

            function success() {
                user.usernameOrEmail = user.username;
                user.redirect = '/?register_success=true';
                loginHandler(req, res, user);
            }

            function error(err) {
                formidable.error(req, '/register', err, function redirect(url) {
                    res.redirect(301, utils.link(url, req.rendrApp.getSession('siteLocation')));
                });
            }

            asynquence().or(error)
                .then(parse)
                .then(submit)
                .val(success);
        }
    })();

    (function login() {
        app.post('/login', handler);

        function handler(req, res) {
            function parse(done) {
                formidable.parse(req, done);
            }

            function submit(done, data) {
                loginHandler(req, res, data);
            }

            function error(err) {
                formidable.error(req, '/login', err, function redirect(url) {
                    res.redirect(301, utils.link(url, req.rendrApp.getSession('siteLocation')));
                });
            }

            asynquence().or(error)
                .then(parse)
                .val(submit);
        }
    })();

    (function anonymousLogin() {
        app.post('/anonymousLogin', handler);

        function handler(req, res) {
            var email;

            function parse(done) {
                formidable.parse(req, done.errfcb);
            }

            function submit(done) {
                /* TODO [MOB-4716] Authentication anonymous to MyAds & My favorites.
                dataAdapter.get(req, '/users/login', {
                    query: {
                        email: email
                    }
                }, done.errfcb); */
                done();
            }

            function success() {
                var url = '/login?loginSuccess=true';

                res.redirect(301, utils.link(url, req.rendrApp.getSession('siteLocation')));
            }

            function error(err) {
                formidable.error(req, '/login', err, function redirect(url) {
                    res.redirect(301, utils.link(url, req.rendrApp.getSession('siteLocation')));
                });
            }

            asynquence().or(error)
                .then(parse)
                .then(submit)
                .val(success);
        }
    })();
};
