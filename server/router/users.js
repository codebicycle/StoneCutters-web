'use strict';

var asynquence = require('asynquence');

module.exports = function usersRouter(app, dataAdapter) {
    var querystring = require('querystring');
    var crypto = require('crypto');

    app.post('/registration', registrationHandler);
    app.post('/login', loginHandler);

    function registrationHandler(req, res) {
        var user = {
            username: req.param('username', null),
            email: req.param('email', null),
            password: req.param('password', null),
            agree_terms: req.param('agree_terms', null),
            location: req.rendrApp.getSession('siteLocation'),
            languageId: 10
        };

        function callValidateUserCallback(done) {
            validateUser(done, user);
        }

        function saveDataRegistrationCallback(done, user) {
            saveData(req, res, user, done);
        }

        function redirectRegistrationHomeCallback(done) {
            res.redirect('/');
        }

        function errorRegistrationCallback(err){
            res.redirect('/registration?' + querystring.stringify(err));
        }

        function validateUser(done, user) {
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
            // agree_terms is string ('on') if accept terms and conditions.
            if (!user.agree_terms) {
                errors.err.push('Accept terms and conditions');
                errors.errFields.push('agree_terms');
            }
            if (errors.err.length) {
                done.fail(errors);
                return;
            }
            done(user);
        }

        function registerUser(done, user) {
            var api = {
                method: 'POST',
                body: user,
                url: '/users'
            };

            dataAdapter.promiseRequest(req, api, done);
        }

        asynquence(callValidateUserCallback).or(errorRegistrationCallback)
            .then(registerUser)
            .then(saveDataRegistrationCallback)
            .then(redirectRegistrationHomeCallback);
    }

    function loginHandler(req, res) {
        var usernameOrEmail = req.param('usernameOrEmail', null);
        var password = req.param('password', null);

        function callGetChallengeCallback(done) {
            getChallenge(done, usernameOrEmail);
        }

        function saveDataLoginCallback(done, user) {
            saveData(req, res, user, done);
        }

        function redirectLoginHomeCallback(done) {
            res.redirect('/');
        }

        function errorLoginCallback(err) {
            console.log(err);
            res.redirect('/login?' + querystring.stringify(err));
        }

        function getChallenge(done, usernameOrEmail) {
            var api = {
                body: {},
                url: '/users/challenge?u=' + usernameOrEmail
            };

            function requestDone(body) {
                var hash = crypto.createHash('md5').update(password).digest('hex');
                hash += usernameOrEmail;
                hash = crypto.createHash('sha512').update(hash).digest('hex');

                var credentials = {
                    c: body.challenge,
                    h: hash
                };

                done(credentials);
            }

            dataAdapter.promiseRequest(req, api, requestDone, done.fail);
        }

        function loginUser(done, credentials) {
            var api = {
                body: {},
                url: '/users/login?' + querystring.stringify(credentials)
            };

            dataAdapter.promiseRequest(req, api, done);
        }

        asynquence().or(errorLoginCallback)
            .then(callGetChallengeCallback)
            .then(loginUser)
            .then(saveDataLoginCallback)
            .then(redirectLoginHomeCallback);
    }

    function saveData(req, res, user, done) {
        req.rendrApp.updateSession({
            user: user
        });
        done();
    }

};
