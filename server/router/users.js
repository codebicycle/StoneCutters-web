'use strict';

module.exports = function(app, dataAdapter) {
    var asynquence = require('asynquence');
    var formidable = require('../formidable');
    var querystring = require('querystring');
    var crypto = require('crypto');

    (function registration() {
        app.post('/register', handler);

        function handler(req, res) {

            function parse(done) {
                formidable(req, done.errfcb);
            }

            function validate(done, user) {
                var errors = {
                    errCode: 400,
                    err: [],
                    errFields: []
                };

                if (!user.username) {
                    errors.err.push('Invalid username');
                    errors.errFields.push('username');
                }
                if (!user.email) {
                    errors.err.push('Invalid email');
                    errors.errFields.push('email');
                }
                if (!user.password) {
                    errors.err.push('Invalid password');
                    errors.errFields.push('password');
                }
                if (!user.agreeTerms) {
                    errors.err.push('Accept terms and conditions');
                    errors.errFields.push('agreeTerms');
                }
                if (errors.err.length) {
                    done.fail(errors);
                    return;
                }
                done(user);
            }

            function submit(done, user) {
                user.location = req.rendrApp.getSession('siteLocation');
                user.languageId = 10;
                dataAdapter.post(req, '/users', {
                    data: user
                }, done.errfcb);
            }

            function save(done, response, user) {
                req.rendrApp.updateSession({
                    user: user
                });
                done();
            }

            function success() {
                res.redirect('/');
            }

            function error(err) {
                var errors = {
                    errCode: 400,
                    errField: [],
                    errMsg: [],
                };
                var url = req.headers.referer;
                var qIndex = url.indexOf('?');

                err.forEach(function each(error) {
                    errors.errField.push(error.selector);
                    errors.errMsg.push(error.message);
                });
                if (qIndex != -1) {
                    url = url.substring(0,qIndex);
                }
                res.redirect(url + '?' + querystring.stringify(errors));
            }

            asynquence().or(error)
                .then(parse)
                .then(validate)
                .then(submit)
                .then(save)
                .val(success);
        }
    })();

    (function login() {
        app.post('/login', handler);

        function handler(req, res) {
            var usernameOrEmail;
            var password;

            function parse(done) {
                formidable(req, done.errfcb);
            }

            function getChallenge(done, data) {
                usernameOrEmail = data.usernameOrEmail;
                password = data.password;
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
                req.rendrApp.updateSession({
                    user: user
                });
                done();
            }

            function success() {
                res.redirect('/');
            }

            function error(err) {
                res.redirect('/login?' + querystring.stringify(err));
            }

            asynquence().or(error)
                .then(parse)
                .then(getChallenge)
                .then(getCredentials)
                .then(submit)
                .then(save)
                .val(success);
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
                res.redirect('/login?emailMsg=The link to access My OLX has been emailed to you.');
            }

            function error(err) {
                res.redirect('/login?' + querystring.stringify(err));
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
            var user = app.getSession('user');

            console.log('\n············ LOGOUT ············');
            console.log(' User -> ');
            console.log(user);
            console.log('············ LOGOUT ············\n');
            app.updateSession({
                user: null
            });
            res.redirect('/');
        }
    })();
};
