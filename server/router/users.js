'use strict';

module.exports = function(app, dataAdapter) {
    var _ = require('underscore');
    var asynquence = require('asynquence');
    var formidable = require('../formidable');
    var querystring = require('querystring');
    var crypto = require('crypto');
    var utils = require('../../shared/utils');

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
                res.redirect(utils.link(redirect, req.rendrApp.getSession('siteLocation')));
            }

            function error(err) {
                var link = '/login';

                if (redirect && redirect !== '/') {
                    link += '?redirect=' + redirect;
                }
                formidable.error(req, link, err, function redirect(url) {
                    res.redirect(utils.link(url, req.rendrApp.getSession('siteLocation')));
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

            function validate(done, data) {
                if (!data.agreeTerms) {
                    res.redirect(301, utils.link('/register?agreeTerms=0', req.rendrApp.getSession('siteLocation')));
                    return;
                }
                done(data);
            }

            function submit(done, data) {
                data.location = req.rendrApp.getSession('siteLocation');
                data.languageId = 10;
                user = _.clone(data);
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
                .then(validate)
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
                if (!data.redirect || data.redirect.match(/(\/register|\/login|\/logout)/g)) {
                    data.redirect = '/';
                }
                loginHandler(req, res, data);
            }

            function error(err) {
                formidable.error(req, '/login', err, function redirect(url) {
                    res.redirect(utils.link(url, req.rendrApp.getSession('siteLocation')));
                });
            }

            asynquence().or(error)
                .then(parse)
                .val(submit);
        }
    })();
};
