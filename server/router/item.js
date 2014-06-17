'use strict';

module.exports = function(app, dataAdapter) {
    var asynquence = require('asynquence');
    var formidable = require('../formidable');
    var querystring = require('querystring');
    var utils = require('../../shared/utils');
    var fs = require('fs');

    (function reply() {
        app.post('/items/:itemId/reply', handler);

        function handler(req, res) {
            var itemId = req.param('itemId', null);

            function parse(done) {
                formidable.parse(req, done.errfcb);
            }

            function submit(done, data) {
                var options = {
                    data: data
                };
                var user = req.rendrApp.session.get('user');

                if (user) {
                    options.query = {
                        token: user.token
                    };
                }
                data.platform = req.rendrApp.session.get('platform');
                dataAdapter.post(req, '/items/' + itemId + '/messages', options, done.errfcb);
            }

            function success() {
                var url = '/iid-' + itemId + '/reply/success';

                res.redirect(301, utils.link(url, req.rendrApp));
            }

            function error(err) {
                formidable.error(req, req.headers.referer.split('?').shift(), err, function redirect(url) {
                    res.redirect(301, utils.link(url, req.rendrApp));
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
            var item;
            var images;
            var oldImages = [];

            function parse(done) {
                formidable.parse(req, {
                    acceptFiles: true
                }, done.errfcb);
            }

            function validate(done, _item, _images) {
                item = _item;
                images = _images;
                item.ipAddress = req.ip;

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
                        languageCode: item.languageCode
                    },
                    data: item
                }, done.errfcb);
            }

            function postImages(done) {
                var data = {};
                var image;

                if (!images || typeof images !== 'object' || !Object.keys(images).length) {
                    return done([]);
                }
                for (image in images) {
                    data[image] = require('restler').file(images[image].path, null, images[image].size, null, images[image].type);
                }
                dataAdapter.post(req, '/images', {
                    query: {
                        postingSession: item.postingSession,
                        url: req.rendrApp.session.get('siteLocation')
                    },
                    data: data,
                    multipart: true
                }, done.errfcb);
            }

            function post(done, response, _images) {
                var query = {
                    postingSession: item.postingSession,
                    languageCode: item.languageCode
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

                res.redirect(301, utils.link(url, req.rendrApp));
                clean();
            }

            function error(err) {
                formidable.error(req, req.headers.referer.split('?').shift(), err, item, function redirect(url) {
                    res.redirect(301, utils.link(url, req.rendrApp));
                    clean();
                });
            }

            function clean() {
                var field;

                if (!images || typeof images !== 'object' || !Object.keys(images).length) {
                    return;
                }
                for (field in images) {
                    fs.unlink(images[field].path);
                }
            }

            asynquence().or(error)
                .then(parse)
                .then(validate)
                .then(postImages)
                .then(post)
                .val(success);
        }
    })();

    (function search() {
        app.post('/search/redirect', handler);
        app.post('/nf/search/redirect', handler);

        function handler(req, res, next) {

            formidable.parse(req, function callback(err, data) {
                var url = '/nf/search' + (data.search ? ('/' + data.search) : '');

                res.redirect(301, utils.link(url, req.rendrApp));
            });
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
                    return res.redirect(301, req.headers.referer);
                }
                else {
                    from = data['from_' + data.name] || '';
                    to = data['to_' + data.name] || '';
                    if (from.length || to.length) {
                        data.currentURL = replaceParam(data.currentURL, 'p' + '-', '');
                        data.currentURL = replaceParam(data.currentURL, data.name + '_', from + '_' + to);
                    }
                }
                res.redirect(301, utils.link(data.currentURL, req.rendrApp));
            });
        }
    })();
};
