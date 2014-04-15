'use strict';

module.exports = function(app, dataAdapter) {
    var asynquence = require('asynquence');
    var formidable = require('../formidable');
    var querystring = require('querystring');
    var fs = require('fs');

    (function reply() {
        app.post('/items/:itemId/reply', handler);

        function handler(req, res) {
            var itemId = req.param('itemId', null);

            function parse(done) {
                formidable(req, done.errfcb);
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
                res.redirect('/items/' + itemId);
            }

            function error(err) {
                console.log(err);
                var url = req.headers.referer;
                var qIndex = url.indexOf('?');

                if (qIndex != -1) {
                    url = url.substring(0,qIndex);
                }
                res.redirect(url+'?' + querystring.stringify(err));
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

            function parse(done) {
                formidable(req, {
                    acceptFiles: true
                }, done.errfcb);
            }

            function validate(done, _item, _images) {
                item = _item;
                images = _images;
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
                    intent: 'create',
                    postingSession: item.postingSession,
                    languageCode: item.languageCode
                };
                var user = req.rendrApp.getSession('user');

                if (user) {
                    query.token = user.token;
                }
                item.images = _images;
                dataAdapter.post(req, '/items', {
                    query: query,
                    data: item
                }, done.errfcb);
            }

            function success(response, item) {
                res.redirect('/items/' + item.id);
                clean();
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
                res.redirect(url+'?' + querystring.stringify(errors));
                clean();
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
        app.post('/items/:itemId/favorite/:intent?', handler);

        function handler(req, res) {
            var itemId = req.param('itemId', null);
            var intent = req.param('intent', '');

            function add(done) {
                var user = req.rendrApp.getSession('user') || {};
                var languages = req.rendrApp.getSession('languages');
                var languageId = req.rendrApp.getSession('selectedLanguage');

                dataAdapter.post(req, '/users/' + user.userId + '/favorites/' + itemId + (intent ? '/' + intent : ''), {
                    query: {
                        token: user.token,
                        languageId: languageId,
                        languageCode: languages._byId[languageId].isocode.toLowerCase()
                    }
                }, done.errfcb);
            }

            function success(done) {
                res.redirect('/items/' + itemId);
            }

            function error(err) {
                var url = req.headers.referer;
                var qIndex = url.indexOf('?');

                if (qIndex != -1) {
                    url = url.substring(0,qIndex);
                }
                res.redirect(url+'?' + querystring.stringify(err));
            }

            asynquence().or(error)
                .then(add)
                .val(success);
        }
    })();

    (function search() {
        app.post('/nf/search/redirect', handler);

        function handler(req, res, next) {
            formidable(req, function callback(err, data) {
                if (!search) {
                    return res.redirect(req.headers.referer);
                }
                res.redirect('/nf/search/' + data.search);
            });
        }
    })();

};
