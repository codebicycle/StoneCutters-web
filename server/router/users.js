'use strict';

module.exports = function userRouter(app) {
    var _ = require('underscore');
    var asynquence = require('asynquence');
    var utils = require('../../shared/utils');
    var formidable = require('../modules/formidable');
    var User = require('../../app/models/user');

    function login() {
        app.post('/login', handler);

        function handler(req, res, next) {
            var user;

            function parse(done) {
                formidable.parse(req, done.errfcb);
            }

            function prepare(done, data) {
                user = new User(_.extend(data, {
                    location: req.rendrApp.session.get('siteLocation'),
                    languageId: req.rendrApp.session.get('languages')._byId[req.rendrApp.session.get('selectedLanguage')].id,
                    platform: req.rendrApp.session.get('platform')
                }));
                done();
            }

            function submit(done) {
                user.login(done, req);
            }

            function success() {
                var redirect = user.get('redirect');

                if (!redirect || redirect.match(/(\/register|\/login|\/logout)/g)) {
                    redirect = '/';
                }
                res.redirect(utils.link(redirect, req.rendrApp));
                if (next && next.errfcb) {
                    next.errfcb();
                }
            }

            function error(err) {
                var link = '/login';
                var redirect = user ? user.get('redirect') : '';

                if (redirect && redirect.match(/(\/register|\/login|\/logout|\/)/g)) {
                    link += '?redirect=' + redirect;
                }
                formidable.error(req, link, err, function redirect(url) {
                    res.redirect(utils.link(url, req.rendrApp));
                    if (next && next.errfcb) {
                        next.errfcb(err);
                    }
                });
            }

            asynquence().or(error)
                .then(parse)
                .then(prepare)
                .then(submit)
                .val(success);
        }

        return handler;
    }

    function register() {
        app.post('/register', handler);

        function handler(req, res) {
            var user;

            function parse(done) {
                formidable.parse(req, done.errfcb);
            }

            function prepare(done, data) {
                user = new User(_.extend(data, {
                    location: req.rendrApp.session.get('siteLocation'),
                    languageId: req.rendrApp.session.get('languages')._byId[req.rendrApp.session.get('selectedLanguage')].id,
                    platform: req.rendrApp.session.get('platform')
                }));
                done();
            }

            function validate(done) {
                if (!user.get('agreeTerms')) {
                    return res.redirect(301, utils.link('/register?agreeTerms=0', req.rendrApp));
                }
                done(user);
            }

            function submit(done) {
                user.register(done, req);
            }

            function login(done) {
                user.login(done, req);
            }

            function success() {
                res.redirect(utils.link('/?register_success=true', req.rendrApp));
            }

            function error(err) {
                formidable.error(req, '/register', err, function redirect(url) {
                    res.redirect(301, utils.link(url, req.rendrApp));
                });
            }

            asynquence().or(error)
                .then(parse)
                .then(prepare)
                .then(validate)
                .then(submit)
                .then(login)
                .val(success);
        }

        return handler;
    }

    return {
        login: login(),
        register: register()
    };
};
