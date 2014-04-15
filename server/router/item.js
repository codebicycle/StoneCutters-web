'use strict';

var asynquence = require('asynquence');
var formidable = require('../formidable');
var querystring = require('querystring');
var fs = require('fs');

module.exports = function itemRouter(app, dataAdapter) {
    app.post('/post', postingHandler);
    app.post('/items/:itemId/reply', replyHandler);
    app.post('/items/:itemId/favorite/:intent?', favoriteHandler);
    app.post('/nf/search/redirect', searchHandler);

    function favoriteHandler(req, res) {
        var itemId = req.param('itemId', null);
        var intent = req.param('intent', '');
        var user = req.rendrApp.getSession('user') || {};
        var languages = req.rendrApp.getSession('languages');
        var languageId = req.rendrApp.getSession('selectedLanguage');
        var params = {
            token: user.token,
            languageId: languageId,
            languageCode: languages._byId[languageId].isocode.toLowerCase()
        };

        function success(done, item) {
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

        function addToFavorites(done, item) {
            intent = (intent ? '/' + intent : '');
            var api = {
                method: 'POST',
                url: '/users/' + user.userId + '/favorites/' + itemId + intent + '?' + querystring.stringify(params)
            };

            dataAdapter.promiseRequest(req, api, done);
        }

        asynquence(addToFavorites).or(error)
            .then(success);
    }

    function replyHandler(req, res) {
        var itemId = req.param('itemId', null);
        var reply = req.body;
        var params = {};
        var user = req.rendrApp.getSession('user');

        if (user) {
            params.token = user.token;
        }
        reply.platform = req.rendrApp.getSession('platform');

        function success(done, item) {
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

        function replyToAd(done, item) {
            var api = {
                method: 'POST',
                url: '/items/' + itemId + '/messages?' + querystring.stringify(params),
                form: reply,
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                }
            };
            dataAdapter.promiseRequest(req, api, done);
        }

        asynquence(replyToAd).or(error)
            .then(success);
    }

    function postingHandler(req, res, next) {
        var item;
        var images;

        function parse(done) {
            formidable(req, done.errfcb);
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

    function searchHandler(req, res, next) {
        var search = req.param('search', '');
        res.redirect('/nf/search/' + search);
    }

};
