'use strict';

module.exports = function userRouter(app, dataAdapter) {
    var _ = require('underscore');
    var asynquence = require('asynquence');
    var querystring = require('querystring');
    var crypto = require('crypto');
    var utils = require('../../shared/utils');
    var formidable = require('../modules/formidable');
    var user = require('../controllers/user');

    (function register() {
        app.post('/register', handler);

        function handler(req, res) {
            function parse(done) {
                formidable.parse(req, done.errfcb);
            }

            function validate(done, data) {
                if (!data.agreeTerms) {
                    res.redirect(301, utils.link('/register?agreeTerms=0', req.rendrApp));
                    return;
                }
                done(data);
            }

            function submit(done, data) {
                user.register(done, req, data);
            }

            function success(user) {
                user.usernameOrEmail = user.username;
                user.redirect = '/?register_success=true';
                loginHandler(req, res, user);
            }

            function error(err) {
                formidable.error(req, '/register', err, function redirect(url) {
                    res.redirect(301, utils.link(url, req.rendrApp));
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
                    res.redirect(utils.link(url, req.rendrApp));
                });
            }

            asynquence().or(error)
                .then(parse)
                .val(submit);
        }
    })();

    var loginHandler = (function login() {
        return function handler(req, res, data) {
            var password = data.password;
            var redirect = data.redirect;

            function submit(done, credentials) {
                user.login(done, req, credentials);
            }

            function save(done, response, user) {
                req.rendrApp.session.persist({
                    user: user
                });
                done();
            }

            function success() {
                res.redirect(utils.link(redirect, req.rendrApp));
            }

            function error(err) {
                var link = '/login';

                if (redirect && redirect !== '/') {
                    link += '?redirect=' + redirect;
                }
                formidable.error(req, link, err, function redirect(url) {
                    res.redirect(utils.link(url, req.rendrApp));
                });
            }

            if (typeof password !== 'string') {
                password = '';
            }
            asynquence().or(error)
                .then(submit)
                .then(save)
                .val(success);
        };
    })();
};
