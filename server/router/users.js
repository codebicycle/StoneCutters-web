'use strict';

var asynquence = require('asynquence');

module.exports = function(app, dataAdapter) {
    var querystring = require('querystring');
    var crypto = require('crypto');
    var debug = require('debug')('arwen:router:users');

    (function registration() {
        app.post('/registration', handler);

        function handler(req, res) {
            var user = {
                username: req.param('username', null),
                email: req.param('email', null),
                password: req.param('password', null),
                agreeTerms: req.param('agreeTerms', null),
                location: req.rendrApp.getSession('siteLocation'),
                languageId: 10
            };

            function validate(done) {
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
                done();
            }

            function submit(done) {
                dataAdapter.post(req, '/users', {
                    data: user
                }, done.errfcb);
            }

            function save(done, response, _user) {
                req.rendrApp.updateSession({
                    user: _user
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
                .then(validate)
                .then(submit)
                .then(save)
                .val(success);
        }
    })();

    (function login() {
        app.post('/login', handler);

        function handler(req, res) {
            var usernameOrEmail = req.param('usernameOrEmail', null);
            var password = req.param('password', null);

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
                req.rendrApp.updateSession({
                    user: user
                });
                done();
            }

            function success() {
                res.redirect('/');
            }

            function error(err) {
                debug('%s %j', 'ERROR', err);
                res.redirect('/login?' + querystring.stringify(err));
            }

            asynquence().or(error)
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
            var email = req.param('email', null);

            function error(err) {
                debug('%s %j', 'ERROR', err);
                res.redirect('/login?' + querystring.stringify(err));
            }

            function validate(done) {
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

            asynquence().or(error)
                .then(validate)
                .then(submit)
                .val(success);
        }
    })();
};
