 'use strict';

module.exports = function(app, dataAdapter) {
    var _ = require('underscore');
    var fs = require('fs');
    var asynquence = require('asynquence');
    var querystring = require('querystring');
    var restler  = require('restler');
    var utils = require('../../shared/utils');
    var formidable = require('../modules/formidable');
    var statsd  = require('../modules/statsd')();
    var User = require('../../app/models/user');
    var Item = require('../../app/models/item');
    var translations = require('../../shared/translations');
    var config = require('../config');
    var configClient = require('../../shared/config');
    var util = require('util');

    (function reply() {
        app.post('/items/:itemId/reply', handler);

        function handler(req, res, next) {
            var itemId = req.param('itemId', null);
            var user;
            var reply;

            function parse(done) {
                formidable.parse(req, done.errfcb);
            }

            function prepare(done, data) {
                var userSession = req.rendrApp.session.get('user');

                if (userSession) {
                    data.token = userSession.token;
                }
                reply = data;
                user = new User({
                    country: req.rendrApp.session.get('location').abbreviation,
                    languageId: req.rendrApp.session.get('languageId'),
                    platform: req.rendrApp.session.get('platform')
                }, {
                    app: req.rendrApp
                });
                done();
            }

            function submit(done) {
                if (reply.email && ~reply.email.indexOf('@yopmail.com')) {
                    console.log('[OLX_DEBUG]', 'ip:', req.rendrApp.session.get('ip'), ' | ', 'email:', reply.email, ' | ', 'name:', reply.name, ' | ', 'phone:', reply.phone, ' | ', 'message:', reply.message);
                }
                user.reply(done, _.extend({}, reply, {
                    id: itemId
                }));
            }

            function store(done, reply) {
                req.rendrApp.session.persist({
                    replyId: reply.id
                });
                done();
            }

            function success() {
                var url = '/iid-' + itemId + '/reply/success';

                res.redirect(utils.link(url, req.rendrApp));
                end();
            }

            function error(err) {
                var url = req.headers.referer || '/items/' + itemId + '/reply';

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
                .then(store)
                .val(success);
        }
    })();

    (function post() {
        app.post('/post', handler);

        function handler(req, res, next) {
            var location = req.rendrApp.session.get('location');
            var platform = req.rendrApp.session.get('platform');
            var dictionary = translations.get(req.rendrApp.session.get('selectedLanguage'));
            var newImages;
            var item;
            var editing;

            if (!req.headers['content-type']) {
                console.log('[OLX_DEBUG]', 'no-content-type', location.url, platform, req.rendrApp.session.get('osName'), req.get('user-agent'));
            }

            function parse(done) {
                formidable.parse(req, {
                    acceptFiles: true
                }, callback);

                function callback(err, _item, _images) {
                    editing = !!(_item && _item.id);

                    if (err === 'aborted') {
                        done.abort();
                        statsd.increment([location.abbreviation, editing ? 'editing' : 'posting', 'error', 'abort', platform]);
                        return fail(err, 'aborted');
                    }
                    newImages = _.clone(_images);
                    done.errfcb.apply(null, Array.prototype.slice.call(arguments, 0));
                }
            }

            function checkWapChangeLocation(done, _item, _images) {
                if (_item.btnChangeLocation) {
                    done.abort();
                    return handlerPostLocation(_item, _images, req, res, next);
                }
                done(_item, _images);
            }

            function prepare(done, _item, images) {
                item = new Item(_.extend(_item, {
                    images: _.map(_.filter(Object.keys(_item), function each(key) {
                        if (key.indexOf('images[')) {
                            return false;
                        }
                        if (_item['del.' + key]) {
                            delete _item[key];
                            delete _item['del.' + key];
                            return false;
                        }
                        return true;
                    }), function each(key) {
                        return _item[key];
                    }).concat(_.map(images, function each(image) {
                        statsd.increment([location.abbreviation, 'posting', 'upload', 'store', platform]);
                        return restler.file(image.path, null, image.size, null, image.type);
                    })),
                    ipAddress: req.ip,
                    location: req.rendrApp.session.get('siteLocation'),
                    languageId: req.rendrApp.session.get('languageId'),
                    platform: platform
                }), {
                    app: req.rendrApp
                });
                done();
            }

            function validate(done) {
                var neighborhood;

                if (item.has('neighborhood')) {
                    neighborhood = item.get('neighborhood');
                    if (neighborhood === '') {
                        done.abort();
                        return fail([{
                            selector: 'neighborhood',
                            message: dictionary['countryoptions.SelectANeighborhood'],
                            label: 'neighborhood'
                        }]);
                    }
                    neighborhood = neighborhood.split('-');
                    item.set({
                        'neighborhood.id': neighborhood[0],
                        'neighborhood.name': neighborhood[1]
                    });
                }
                done();
            }

            function post(done) {
                item.post(done);
            }

            function success(done) {
                var url = '/' + (editing ? 'edititem' : 'posting') + '/success/' + item.get('id') + '?sk=' + item.get('securityKey');

                req.rendrApp.session.persist({
                    itemId: item.get('id')
                });
                res.redirect(utils.link(url, req.rendrApp));
                done();
            }

            function fail(err, track) {
                var url = req.headers.referer || '/posting';

                if (!track && err && !Array.isArray(err)) {
                    console.log('[OLX_DEBUG]', 'post', err instanceof Error ? JSON.stringify(err.stack) : err);
                }
                formidable.error(req, url.split('?').shift(), err, item ? item.toJSON() : {}, function redirect(url) {
                    res.redirect(utils.link(url, req.rendrApp));
                    clean();
                });
            }

            function clean() {
                if (!newImages || typeof newImages !== 'object' || !Object.keys(newImages).length) {
                    return;
                }
                Object.keys(newImages).forEach(function each(key) {
                    statsd.increment([location.abbreviation, 'posting', 'upload', 'delete', platform]);
                    fs.unlink(newImages[key].path, utils.noop);
                });
            }

            asynquence().or(fail)
                .then(parse)
                .then(checkWapChangeLocation)
                .then(prepare)
                .then(validate)
                .then(post)
                .then(success)
                .val(clean);
        }
    })();

    function handlerPostLocation(item, images, req, res, next) {
        var location = req.rendrApp.session.get('location');
        var platform = req.rendrApp.session.get('platform');

        function store(done) {
            req.rendrApp.session.persist({
                form: {
                    values: item
                }
            });
            done(item);
        }

        function redirect(item) {
            var url = '/location?target=posting/' + item['category.parentId'] + '/' + item['category.id'];

            statsd.increment([location.abbreviation, 'posting', 'success', 'location', platform]);
            res.redirect(utils.link(url, req.rendrApp));
            clean();
        }

        function error(err) {
            statsd.increment([location.abbreviation, 'posting', 'error', 'location', platform]);
            res.redirect(utils.link('/location?target=posting', req.rendrApp));
            clean();
        }

        function clean() {
            var field;

            if (!images || typeof images !== 'object' || !Object.keys(images).length) {
                return;
            }
            for (field in images) {
                statsd.increment([location.abbreviation, 'posting', 'upload', 'delete', platform]);
                fs.unlink(images[field].path, callback);
            }

            function callback(err) {
                if (err) {
                    return console.log('[OLX_DEBUG]', 'tmp', err);
                }
            }
        }

        asynquence().or(error)
            .then(store)
            .val(redirect);
    }

    (function postLocation() {
        app.post('/post/location', handler);

        function handler(req, res, next) {

            function parse(done) {
                formidable.parse(req, {
                    acceptFiles: true
                }, done.errfcb);
            }

            function redirect(item, images) {
                handlerPostLocation(item, images, req, res, next);
            }

            function error(err) {
                res.redirect(utils.link('/location?target=posting', req.rendrApp));
            }

            asynquence().or(error)
                .then(parse)
                .val(redirect);
        }
    })();

    (function search() {
        app.post('/search/redirect', handler);
        app.post('/nf/search/redirect', handler);

        function handler(req, res, next) {
            function parse(done) {
                formidable.parse(req, done.errfcb);
            }

            function success(data) {
                var url = data.search ? ('/nf/search/' + data.search) : '/nf/all-results';

                res.redirect(utils.link(url, req.rendrApp));
            }

            function error(err) {
                var location = req.rendrApp.session.get('location');
                var platform = req.rendrApp.session.get('platform');
                var url = req.headers.referer || '/';

                res.redirect(utils.link(url.split('?').shift(), req.rendrApp));
                statsd.increment([location.name, 'search', 'error', platform]);
            }

            asynquence().or(error)
                .then(parse)
                .val(success);
        }
    })();

    (function filter() {
        app.post('/nf/filter/redirect', handler);

        function handler(req, res, next) {

            function replaceParam(url, name, value) {
                var regExp;

                if (!~url.indexOf(name)) {
                    url = value ? [url, '-', value].join('') : url;
                }
                else {
                    regExp = new RegExp(name + '([a-zA-Z0-9_]*)', 'g');
                    url = url.replace(regExp, (value ? (name + value) : value));
                }
                return url;
            }

            formidable.parse(req, function callback(err, data) {
                var from;
                var to;

                if (!data.currentURL) {
                    return res.redirect(req.headers.referer);
                }
                else {
                    from = data['from_' + data.name] || '';
                    to = data['to_' + data.name] || '';
                    if (from.length || to.length) {
                        data.currentURL = replaceParam(data.currentURL, 'p' + '-', '');
                        data.currentURL = replaceParam(data.currentURL, data.name + '_', from + '_' + to);
                    }
                }
                res.redirect(utils.link(data.currentURL, req.rendrApp));
            });
        }
    })();

    (function deleteitem() {
        app.post('/myolx/deleteitem/:itemId', handler);

        function handler(req, res, next) {
            var itemId = req.param('itemId', null);
            var item;
            var removedata;

            function parse(done) {
                formidable.parse(req, done.errfcb);
            }

            function prepare(done, data) {
                item = new Item({
                    id: itemId
                }, {
                    app: req.rendrApp
                });
                removedata = data;
                done();
            }
            function remove(done) {
                var reason = removedata.close_reason;
                var comment = removedata.close_comment;

                item.remove({
                    reason: reason,
                    comment: comment
                }, done);
            }
            function success(data) {
                var url = '/myolx/myadslisting?deleted=true';

                res.redirect(utils.link(url, req.rendrApp));
            }

            function error(err) {
                var url = req.headers.referer || '/';

                res.redirect(utils.link(url.split('?').shift(), req.rendrApp));
            }

            asynquence().or(error)
                .then(parse)
                .then(prepare)
                .then(remove)
                .val(success);
        }
    })();

    (function flagItem() {
        app.post('/items/:itemId/flag', handler);

        function handler(req, res, next) {
            var location = req.rendrApp.session.get('location').location;
            var dictionary = translations.get(req.rendrApp.session.get('selectedLanguage'));
            var itemId = req.param('itemId', null);
            var report = null;

            function parse(done) {
                formidable.parse(req, done.errfcb);
            }

            function configure(done, data) {
                var zendesk;

                zendesk = _.defaults({}, config.get(['emails', 'zendesk', location], {}), config.get(['emails', 'zendesk', 'default']));
                zendesk = _.defaults({}, configClient.get(['mails', 'zendesk', location], {}), zendesk);

                report = data;

                done(zendesk);
            }

            function prepare(done, zendesk) {
                var from = 'Reported Item';
                var email = 'reporteditem@olx.com';
                var subject = util.format("[Reported item] Reason: %s - Item id: %s", report.reason, itemId);
                var body = util.format("Item id: %s\nReason: %s\nDescription: %s\n", itemId, report.reason, report.description);

                var ticket = {
                    requester: {
                        name: from,
                        email: email
                    },
                    subject:subject,
                    comment: {
                        public: true,
                        body: body
                    }
                };

                if (zendesk.brand_id) {
                    ticket.brand_id = zendesk.brand_id;
                }
                done(zendesk, ticket);
            }

            function submit(done, zendesk, ticket) {
                restler.post('https://' + zendesk.subdomain + '.zendesk.com/api/v2/tickets.json', {
                    data: {
                        ticket: ticket
                    },
                    username: zendesk.email,
                    password: zendesk.password
                })
                .on('success', function onSuccess(data) {
                    done();
                })
                .on('fail', function onFail(err, resp) {
                    done.fail([{
                        selector: 'reason',
                        message: dictionary['postingerror.ThereWasAnErrorTryingToFulfillYourRequest']
                    }]);
                });
            }

            function success() {
                var url = 'items/' + itemId + '/flag/success';

                res.redirect(utils.link(url, req.rendrApp));
            }

            function error(err) {
                var url = req.headers.referer || '/items/' + itemId + '/flag';

                formidable.error(req, url.split('?').shift(), err, report, function redirect(url) {
                    res.redirect(utils.link(url, req.rendrApp));
                });
            }

            asynquence().or(error)
                .then(parse)
                .then(configure)
                .then(prepare)
                .then(submit)
                .val(success);
        }
    })();

};
