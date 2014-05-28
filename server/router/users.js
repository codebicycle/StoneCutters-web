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
                res.redirect(utils.link(redirect, req.rendrApp.getSession('siteLocation')));
            }

            function error(err) {
                var url = '/login?' + querystring.stringify(err);

                res.redirect(utils.link(url, req.rendrApp.getSession('siteLocation')));
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
                formidable(req, done.errfcb);
            }

            function validate(done, data) {
                var errors = {
                    errCode: 400,
                    err: [],
                    errFields: []
                };

                if (!data.username) {
                    errors.err.push('Invalid username');
                    errors.errFields.push('username');
                }
                if (!data.email) {
                    errors.err.push('Invalid email');
                    errors.errFields.push('email');
                }
                if (!data.password) {
                    errors.err.push('Invalid password');
                    errors.errFields.push('password');
                }
                if (!data.agreeTerms) {
                    errors.err.push('Accept terms and conditions');
                    errors.errFields.push('agreeTerms');
                }
                if (errors.err.length) {
                    done.fail(errors);
                    return;
                }
                user = data;
                done(data);
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
                var url = req.headers.referer;
                var qIndex = url.indexOf('?');
                var errors;

                if (_.isArray(err)) {
                    errors = {
                        errCode: 400,
                        errField: [],
                        errMsg: [],
                    };
                    err.forEach(function each(error) {
                        errors.errField.push(error.selector);
                        errors.errMsg.push(error.message);
                    });
                }
                else {
                    errors = err;
                }
                if (qIndex != -1) {
                    url = url.substring(0,qIndex);
                }
                url += '?' + querystring.stringify(errors);
                res.redirect(utils.link(url, req.rendrApp.getSession('siteLocation')));
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
                formidable(req, done);
            }

            function submit(done, data) {
                loginHandler(req, res, data);
            }

            function error(err) {
                var url = '/login?' + querystring.stringify(err);

                res.redirect(utils.link(url, req.rendrApp.getSession('siteLocation')));
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
                formidable(req, done.errfcb);
            }

            function validate(done, data) {
                email = data.email;
                if (!email) {
                    done.fail({
                        errCode: 400,
                        err: ['Invalid email']
                    });
                }
                done();
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

                res.redirect(utils.link(url, req.rendrApp.getSession('siteLocation')));
            }

            function error(err) {
                var url = '/login?' + querystring.stringify(err);
                
                res.redirect(utils.link(url, req.rendrApp.getSession('siteLocation')));
            }

            asynquence().or(error)
                .then(parse)
                .then(validate)
                .then(submit)
                .val(success);
        }
    })();

    (function logout() {
        app.get('/logout', handler);

        function handler(req, res) {
            var app = req.rendrApp;
            var url;

            app.deleteSession('user');
            url = (app.getSession('referer') || '/');
            res.redirect(utils.link(url, app.getSession('siteLocation')));
        }
    })();
};
