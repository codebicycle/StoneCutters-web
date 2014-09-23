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
    var keyades = ['www.olx.com.ng', 'www.olx.co.ke'];

    (function reply() {
        app.post('/items/:itemId/reply', handler);

        function handler(req, res) {
            var location = req.rendrApp.session.get('location');
            var platform = req.rendrApp.session.get('platform');
            var itemId = req.param('itemId', null);
            var reply;

            function parse(done) {
                formidable.parse(req, done.errfcb);
            }

            function submit(done, data) {
                var selectedLanguage = req.rendrApp.session.get('selectedLanguage');
                var language = req.rendrApp.session.get('languages')._byId[selectedLanguage] || {};
                var platform = req.rendrApp.session.get('platform');
                var options = {
                    data: data,
                    query: {
                        languageId: language.id,
                        platform: platform
                    }
                };
                var user = req.rendrApp.session.get('user');

                reply = data;
                if (user) {
                    options.query.token = user.token;
                }
                data.platform = platform;
                dataAdapter.post(req, '/items/' + itemId + '/messages', options, done.errfcb);
            }

            function success(response, body) {
                var url = '/iid-' + itemId + '/reply/success';

                track(body);
                res.redirect(utils.link(url, req.rendrApp));
                statsd.increment([location.name, 'reply', 'success', platform]);
            }

            function track(body) {
                if (_.contains(keyades, location.url)) {
                    restler.get(['http://k.keyade.com/kaev/1/?kaPcId=98678&kaEvId=69473&kaEvAcId=3&kaEvMcId=', body.id, '&kaEvCt1=1'].join(''));
                }
            }

            function error(err) {
                var url = req.headers.referer || '/items/' + itemId + '/reply';

                formidable.error(req, url.split('?').shift(), err, reply, function redirect(url) {
                    res.redirect(utils.link(url, req.rendrApp));
                    statsd.increment([location.name, 'reply', 'error', platform]);
                });
            }

            asynquence().or(error)
                .then(parse)
                .then(submit)
                .val(success);
        }
    })();

    (function post() {
        app.post('/post', handler);

        function handler(req, res, next) {
            var siteLocation = req.rendrApp.session.get('siteLocation');
            var location = req.rendrApp.session.get('location');
            var platform = req.rendrApp.session.get('platform');
            var languages = req.rendrApp.session.get('languages');
            var language = languages._byId[req.rendrApp.session.get('selectedLanguage')];
            var item;
            var images;
            var oldImages = [];

            function parse(done) {
                function callback(err) {
                    if (err === 'aborted') {
                        done.abort();
                        return fail(err, 'aborted');
                    }
                    done.errfcb.apply(null, Array.prototype.slice.call(arguments, 0));
                }

                formidable.parse(req, {
                    acceptFiles: true
                }, callback);
            }

            function log(done, _item, _images) {
                var field;

                if (_images && typeof _images === 'object' && Object.keys(_images).length) {
                    for (field in _images) {
                        statsd.increment([location.name, 'posting', 'image', platform]);
                    }
                }
                done(_item, _images);
            }

            function checkWapChangeLocation(done, _item, _images) {
                if (_item.btnChangeLocation) {
                    done.abort();
                    return handlerPostLocation(_item, _images, req, res, next);
                }
                done(_item, _images);
            }

            function validate(done, _item, _images) {
                function callback(err, response, body) {
                    if (err) {
                        return done.fail(err);
                    }
                    if (body) {
                        done.abort();
                        return fail(body, 'invalid');
                    }
                    done(response, body);
                }

                item = _item;
                images = _images;
                item.ipAddress = req.ip;
                item.location = siteLocation;
                item.languageId = language.id;
                item.platform = platform;
                for (var key in item) {
                    if (!key.indexOf('opt.') && !item[key]) {
                        delete item[key];
                    }
                    if (item.id && !key.indexOf('image.')) {
                        if (!item['del.' + key]) {
                            oldImages.push(item[key]);
                        }
                        delete item[key];
                        delete item['del.' + key];
                    }
                }
                dataAdapter.post(req, '/items', {
                    query: {
                        intent: 'validate',
                        postingSession: item.postingSession,
                        languageId: language.id,
                        platform: platform
                    },
                    data: item
                }, callback);
            }

            function postImages(done) {
                var data = {};
                var image;

                function callback(err, response, _images) {
                    if (err) {
                        done.abort();
                        if (response.statusCode === 400) {
                            return fail(err, 'invalid_images');
                        }
                        return fail(err, 'error_images');
                    }
                    done(response, _images);
                }

                if (!images || typeof images !== 'object' || !Object.keys(images).length) {
                    return done([]);
                }
                for (image in images) {
                    data[image] = restler.file(images[image].path, null, images[image].size, null, images[image].type);
                }
                dataAdapter.post(req, '/images', {
                    query: {
                        postingSession: item.postingSession,
                        url: req.rendrApp.session.get('siteLocation'),
                        platform: platform
                    },
                    data: data,
                    multipart: true
                }, callback);
            }

            function post(done, response, _images) {
                var query = {
                    postingSession: item.postingSession,
                    languageId: language.id,
                    platform: platform
                };
                var user = req.rendrApp.session.get('user');

                if (!item.id) {
                    query.intent = 'create';
                }
                if (user) {
                    query.token = user.token;
                }
                else if (item.id && item.sk) {
                    query.securityKey = item.sk;
                    delete item.sk;
                }
                if (_images && _images.length) {
                    item.images = _images;
                }
                if (oldImages && oldImages.length) {
                    item.images = (item.images ? item.images.concat(oldImages) : oldImages);
                }
                if (item.images) {
                    item.images = item.images.join(',');
                }
                dataAdapter.post(req, '/items' + (item.id ? '/' + item.id + '/edit' : ''), {
                    query: query,
                    data: item
                }, done.errfcb);
            }

            function success(response, item) {
                var url = '/posting/success/' + item.id + '?sk=' + item.securityKey;

                track(item);
                res.redirect(utils.link(url, req.rendrApp));
                statsd.increment([location.name, 'posting', 'success', platform]);
                clean();
            }

            function track(item) {
                if (_.contains(keyades, location.url)) {
                    restler.get(['http://k.keyade.com/kaev/1/?kaPcId=98678&kaEvId=69472&kaEvAcId=2&kaEvMcId=', item.id, '&kaEvCt1=1'].join(''));
                }
            }

            function fail(err, track) {
                var url = req.headers.referer || '/posting';

                if (!track || track === 'error') {
                    console.log('[OLX_DEBUG]', 'post', err);
                }
                statsd.increment([location.name, 'posting', track || 'error', platform]);
                formidable.error(req, url.split('?').shift(), err, item, function redirect(url) {
                    res.redirect(utils.link(url, req.rendrApp));
                    clean();
                });
            }

            function clean() {
                var field;

                if (!images || typeof images !== 'object' || !Object.keys(images).length) {
                    return;
                }
                for (field in images) {
                    statsd.increment([location.name, 'posting', 'delete_image', platform]);
                    fs.unlink(images[field].path, callback);
                }

                function callback(err) {
                    if (err) {
                        return console.log('[OLX_DEBUG]', 'tmp', err);
                    }
                }
            }

            asynquence().or(fail)
                .then(parse)
                .then(log)
                .then(checkWapChangeLocation)
                .then(validate)
                .then(postImages)
                .then(post)
                .val(success);
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

            statsd.increment([location.name, 'posting', 'location', platform]);
            res.redirect(utils.link(url, req.rendrApp));
            clean();
        }

        function error(err) {
            statsd.increment([location.name, 'posting', 'error_location', platform]);
            res.redirect(utils.link('/location?target=posting', req.rendrApp));
            clean();
        }

        function clean() {
            var field;

            if (!images || typeof images !== 'object' || !Object.keys(images).length) {
                return;
            }
            for (field in images) {
                statsd.increment([location.name, 'posting', 'delete_image', platform]);
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
                var url = '/nf/search' + (data.search ? ('/' + data.search) : '');

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
};
