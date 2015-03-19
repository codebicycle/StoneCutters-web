'use strict';

module.exports = function userRouter(app) {
    var _ = require('underscore');
    var asynquence = require('asynquence');
    var utils = require('../../shared/utils');
    var formidable = require('../modules/formidable');
    var statsd  = require('../modules/statsd')();
    var User = require('../../app/models/user');
    var Conversation = require('../../app/models/conversation');

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
                    country: req.rendrApp.session.get('location').abbreviation,
                    languageId: req.rendrApp.session.get('languageId'),
                    platform: req.rendrApp.session.get('platform')
                }), {
                    app: req.rendrApp
                });
                done();
            }

            function submit(done) {
                user.login(done);
            }

            function success() {
                var redirect = user.get('redirect');

                if (!redirect || redirect.match(/(\/register|\/login|\/logout)/g)) {
                    redirect = '/';
                }
                res.redirect(utils.link(redirect, req.rendrApp));
                end();
            }

            function error(err) {
                var link = '/login';
                var redirect = user ? user.get('redirect') : '';

                if (redirect && redirect.match(/(\/register|\/login|\/logout|\/)/g)) {
                    link += '?redirect=' + redirect;
                }
                formidable.error(req, link, err, user.toJSON(), function redirect(url) {
                    res.redirect(utils.link(url, req.rendrApp));
                    end(err);
                });
            }

            function end(err) {
                if (next && next.errfcb) {
                    next.errfcb(err);
                }
            }

            asynquence().or(error)
                .then(parse)
                .then(prepare)
                .then(submit)
                .val(success);
        }

        return handler;
    }

    function lostpassword() {
        app.post('/lostpassword', handler);

        function handler(req, res, next) {
            var user;

            function parse(done) {
                formidable.parse(req, done.errfcb);
            }

            function prepare(done, data) {
                user = new User(_.extend(data, {
                    location: req.rendrApp.session.get('siteLocation'),
                    country: req.rendrApp.session.get('location').abbreviation,
                    languageId: req.rendrApp.session.get('languageId'),
                    platform: req.rendrApp.session.get('platform')
                }), {
                    app: req.rendrApp
                });
                done();
            }

            function submit(done) {
                user.lostpassword(done);
            }

            function success() {
                var redirect = '/lostpassword?success=true';

                res.redirect(utils.link(redirect, req.rendrApp));
                end();
            }

            function error(err) {
                formidable.error(req, '/lostpassword', err, user.toJSON(), function redirect(url) {
                    res.redirect(utils.link(url, req.rendrApp));
                    end(err);
                });
            }

            function end(err) {
                if (next && next.errfcb) {
                    next.errfcb(err);
                }
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

        function handler(req, res, next) {
            var location = req.rendrApp.session.get('location');
            var platform = req.rendrApp.session.get('platform');
            var user;

            function parse(done) {
                formidable.parse(req, done.errfcb);
            }

            function prepare(done, data) {
                user = new User(_.extend(data, {
                    'new': true,
                    location: req.rendrApp.session.get('siteLocation'),
                    country: location.abbreviation,
                    languageId: req.rendrApp.session.get('languageId'),
                    platform: platform
                }), {
                    app: req.rendrApp
                });
                done();
            }

            function validate(done) {
                if (!user.get('agreeTerms')) {
                    res.redirect(301, utils.link('/register?agreeTerms=0', req.rendrApp));
                    statsd.increment([location.abbreviation, 'register', 'error', 'terms', platform]);
                    return end();
                }
                done(user);
            }

            function submit(done) {
                user.register(done);
            }

            function login(done) {
                user.login(done);
            }

            function success() {
                res.redirect(utils.link('/?register_success=true', req.rendrApp));
                end();
            }

            function error(err) {
                formidable.error(req, '/register', err, user.toJSON(), function redirect(url) {
                    res.redirect(301, utils.link(url, req.rendrApp));
                    end(err);
                });
            }

            function end(err) {
                if (next && next.errfcb) {
                    next.errfcb(err);
                }
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

    function registerwithConfirmation() {
        app.post('/register-withconf', handler);

        function handler(req, res, next) {
            var location = req.rendrApp.session.get('location');
            var platform = req.rendrApp.session.get('platform');
            var user;

            function parse(done) {
                formidable.parse(req, done.errfcb);
            }

            function prepare(done, data) {
                user = new User(_.extend(data, {
                    'new': true,
                    location: req.rendrApp.session.get('siteLocation'),
                    country: location.abbreviation,
                    languageId: req.rendrApp.session.get('languageId'),
                    platform: platform,
                    identityType: 1,
                    withConfirmation: true
                }), {
                    app: req.rendrApp
                });
                done();
            }

            function validate(done) {
                if (!user.get('agreeTerms')) {
                    res.redirect(301, utils.link('/register?agreeTerms=0', req.rendrApp));
                    statsd.increment([location.abbreviation, 'register', 'error', 'terms', platform]);
                    return end();
                }
                done(user);
            }

            function submit(done) {
                user.register(done);
            }

            function success() {
                res.redirect(utils.link('/register/success', req.rendrApp));
                end();
            }

            function error(err) {
                formidable.error(req, '/register', err, user.toJSON(), function redirect(url) {
                    res.redirect(301, utils.link(url, req.rendrApp));
                    end(err);
                });
            }

            function end(err) {
                if (next && next.errfcb) {
                    next.errfcb(err);
                }
            }

            asynquence().or(error)
                .then(parse)
                .then(prepare)
                .then(validate)
                .then(submit)
                .val(success);
        }

        return handler;
    }

    function reply() {
        app.post('/myolx/conversation/:threadId', handler);
        app.post('/myolx/conversation/mail', handler);

        function handler(req, res, next) {
            var threadId = req.param('threadId', null);
            var hash = req.param('hash', null);
            var conversation;
            var reply;
            var url;

            function parse(done) {
                formidable.parse(req, done.errfcb);
            }

            function prepare(done, data) {
                var user = req.rendrApp.session.get('user');

                reply = data;
                conversation = new Conversation({
                    country: req.rendrApp.session.get('location').abbreviation,
                    location: req.rendrApp.session.get('location').url,
                    platform: req.rendrApp.session.get('platform'),
                    languageId: req.rendrApp.session.get('languageId'),
                    message: data.message
                }, {
                    app: req.rendrApp
                });
                if (threadId && threadId !== 'mail') {
                    conversation.set('user', user);
                    conversation.set('threadId', threadId);
                    url = '/myolx/conversation/' + threadId;
                }
                else if (hash) {
                    conversation.set('hash', hash);
                    url = '/myolx/conversation/mail?hash=' + hash;
                }
                done();
            }

            function submit(done) {
                conversation.reply(done);
            }

            function success() {
                res.redirect(utils.link(url, req.rendrApp));
                end();
            }

            function error(err) {
                formidable.error(req, url.split('?').shift(), err, reply, function redirect(url) {
                    res.redirect(utils.link(url, req.rendrApp));
                    end(err);
                });
            }

            function end(err) {
                if (next && next.errfcb) {
                    next.errfcb(err);
                }
            }

            asynquence().or(error)
                .then(parse)
                .then(prepare)
                .then(submit)
                .val(success);
        }
    }

    return {
        login: login(),
        register: register(),
        lostpassword: lostpassword(),
        registerwithConfirmation: registerwithConfirmation(),
        reply: reply()
    };
};
