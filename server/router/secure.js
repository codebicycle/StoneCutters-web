'use strict';

module.exports = function itemRouter(app, dataAdapter) {
    var _ = require('underscore');
    var restler = require('restler');
    var asynquence = require('asynquence');
    var utils = require('../../shared/utils');
    var config = require('../config');
    var formidable = require('../modules/formidable');

    (function recaptcha() {
        app.get('/secure/recaptcha', handler);

        function handler(req, res) {
            var secretKey = config.get(['emails', 'captcha', 'secret']);
            var response = req.param('response');
            var remoteIp = req.param('remoteip');

            restler.get('https://www.google.com/recaptcha/api/siteverify?secret='+secretKey+'&response='+response+'&remoteip='+remoteIp)
            .on('success', function(data, response) {
                res.json(data);
            })
            .on('error', function(err, response) {
                res.json(err);
            });
        }
    })();

    (function send() {
        app.post('/secure/send', handler);

        function handler(req, res) {
            var location = req.rendrApp.session.get('location');
            var zendesk = _.defaults({}, config.get(['emails', 'zendesk', location.url], {}), config.get(['emails', 'zendesk', 'default']));

            function parse(done) {
                formidable.parse(req, done.errfcb);
            }

            function submit(done, data) {
                restler.post('https://' + zendesk.subdomain + '.zendesk.com/api/v2/tickets.json', {
                    data: {
                        ticket: {
                            requester: {
                                name: data.name,
                                email: data.email
                            },
                            subject: data.subject,
                            comment: {
                                body: data.message
                            }
                        }
                    },
                    username: zendesk.email,
                    password: zendesk.password
                })
                .on('success', function onSuccess(data, response) {
                    done(data);
                })
                .on('fail', function onFail(err, response) {
                    done.fail(err);
                });
            }

            function success(data) {
                res.json({
                    send: true
                });
            }

            function error(err) {
                res.json({
                    send: false,
                    error: err
                });
            }

            asynquence().or(error)
                .then(parse)
                .then(submit)
                .val(success);
        }
    })();
};
