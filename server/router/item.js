'use strict';

module.exports = function(app, dataAdapter) {
    var asynquence = require('asynquence');
    var formidable = require('../formidable');
    var querystring = require('querystring');
    var utils = require('../utils');
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
                var user = req.rendrApp.getSession('user');

                if (user) {
                    options.query = {
                        token: user.token
                    };
                }
                data.platform = req.rendrApp.getSession('platform');
                dataAdapter.post(req, '/items/' + itemId + '/messages', options, done.errfcb);
            }

            function success() {
                var url = '/iid-' + itemId + '/reply/success';

                res.redirect(301, utils.link(url, req.rendrApp.getSession('siteLocation')));
            }

            function error(err) {
                formidable.error(req, req.headers.referer.split('?').shift(), err, function redirect(url) {
                    res.redirect(301, utils.link(url, req.rendrApp.getSession('siteLocation')));
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
                        url: req.rendrApp.getSession('siteLocation')
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
                var user = req.rendrApp.getSession('user');

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

                res.redirect(301, utils.link(url, req.rendrApp.getSession('siteLocation')));
                clean();
            }

            function error(err) {
                formidable.error(req, req.headers.referer.split('?').shift(), err, item, function redirect(url) {
                    res.redirect(301, utils.link(url, req.rendrApp.getSession('siteLocation')));
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

    (function favorite() {
        app.get('/items/:itemId/favorite/:intent?', handler);

        function handler(req, res) {
            var itemId = req.param('itemId', null);
            var intent = req.param('intent', '');

            function add(done) {
                var user = req.rendrApp.getSession('user') || {};

                dataAdapter.post(req, '/users/' + user.userId + '/favorites/' + itemId + (intent ? '/' + intent : ''), {
                    query: {
                        token: user.token
                    }
                }, done.errfcb);
            }

            function success(done) {
                var url = '/des-iid-' + itemId;

                res.redirect(301, utils.link(url, req.rendrApp.getSession('siteLocation')));
            }

            function error(err) {
                var url = req.headers.referer;
                var qIndex = url.indexOf('?');

                if (qIndex != -1) {
                    url = url.substring(0,qIndex);
                }
                url += '?' + querystring.stringify(err);
                res.redirect(301, utils.link(url, req.rendrApp.getSession('siteLocation')));
            }

            asynquence().or(error)
                .then(add)
                .val(success);
        }
    })();

    (function search() {
        app.post('/search/redirect', handler);
        app.post('/nf/search/redirect', handler);

        function handler(req, res, next) {

            function replaceParam(url, name, value) {
                if (!~url.indexOf(name)) {
                    url = url + '-' + name + value;
                } else {
                    var regExp = new RegExp(name + '([a-zA-Z0-9_]*)', 'g');
                    url = url.replace(regExp, name + value);
                }
                return url;
            }

            formidable.parse(req, function callback(err, data) {
                var url;

                if (!data.search && !data.currentURL) {
                    return res.redirect(301, req.headers.referer);
                }
                if (data.search) {
                    url = '/nf/search/' + data.search;
                } else {
                    var from = data['from_' + data.name] || '';
                    var to = data['to_' + data.name] || '';

                    url = data.currentURL;
                    if (from.length || to.length) {
                        url = replaceParam(url, 'p' + '-', 1);
                        url = replaceParam(url, data.name + '_', from + '_' + to);
                    }
                }
                res.redirect(301, utils.link(url, req.rendrApp.getSession('siteLocation')));
            });
        }
    })();

    (function removeItem() {
        app.get('/myolx/deleteitem/:itemId?', handler);

        function handler(req, res, next) {
            var itemId = req.param('itemId', '');

            function validate(done) {
                var errors = {
                    errCode: 400,
                    err: [],
                    errFields: []
                };

                if (!itemId) {
                    errors.err.push('Invalid itemId');
                    errors.errFields.push('itemId');
                }
                if (errors.err.length) {
                    done.fail(errors);
                    return;
                }
                done();
            }

            function remove(done) {
                var user = req.rendrApp.getSession('user') || {};
                var query = {
                    token: user.token
                };

                dataAdapter.post(req, '/items/' + itemId + '/delete', {
                    query: query
                }, done.errfcb);
            }

            function success(response) {
                var url = '/myolx/myadslisting?deleted=true';

                res.redirect(301, utils.link(url, req.rendrApp.getSession('siteLocation')));
            }

            function error(err) {
                var errors;
                var url = req.headers.referer;
                var qIndex = url.indexOf('?');

                if (!err.errCode) {
                    errors = {
                        errCode: 400,
                        errField: [],
                        errMsg: [],
                    };

                    err.forEach(function each(error) {
                        errors.errField.push(error.selector);
                        errors.errMsg.push(error.message);
                    });
                } else {
                    errors = err;
                }

                if (qIndex != -1) {
                    url = url.substring(0,qIndex);
                }
                url += '?' + querystring.stringify(errors);
                res.redirect(301, utils.link(url, req.rendrApp.getSession('siteLocation')));
            }

            asynquence().or(error)
                .then(validate)
                .then(remove)
                .val(success);
        }
    })();

};
