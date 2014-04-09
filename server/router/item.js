'use strict';

var asynquence = require('asynquence');

module.exports = function itemRouter(app, dataAdapter) {
    var querystring = require('querystring');

    app.post('/post', postingHandler);
    app.post('/items/:itemId/reply', replyHandler);
    app.post('/items/:itemId/favorite/:intent?', favoriteHandler);

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

    function postingHandler(req, res) {
        var item = req.body;

        item.postingSession = req.param('postingSession', null);
        item.intent = req.param('intent', null);
        item.token = req.param('token', null);

        function callValidateItemCallback(done) {
            validateItem(done, item);
        }

        function redirectToSuccessPostCallback(done, item) {
            res.redirect('/items/' + item.id);
        }

        function errorPostingCallback(err) {
            var errors = {
                errCode: 400,
                errField: [],
                errMsg: [],
            };
            err.original.body.forEach(function each(error) {
                errors.errField.push(error.selector);
                errors.errMsg.push(error.message);
            });
            var url = req.headers.referer;
            var qIndex = url.indexOf('?');

            if (qIndex != -1) {
                url = url.substring(0,qIndex);
            }
            res.redirect(url+'?' + querystring.stringify(errors));
        }

        function validateItem(done, item) {
            var api = {
                method: 'POST',
                url: '/items?' + querystring.stringify({
                    postingSession: item.postingSession,
                    intent: 'validate',
                    languageCode: item.languageCode
                }),
                body: item
            };

            function success(results) {
                done(item);
            }

            item.priceC = Number(item.priceC);
            item.category.parentId = Number(item.category.parentId);
            item.category.id = Number(item.category.id);
            dataAdapter.promiseRequest(req, api, success, done.fail);
        }

        function postItem(done, item) {
            var user = req.rendrApp.getSession('user');
            var api = {
                method: 'POST'
            };
            var params = {
                postingSession: item.postingSession,
                intent: item.intent,
                languageCode: item.languageCode
            };

            if (user) {
                params.token = user.token;
            }
            item.priceC = Number(item.priceC);
            item.category.parentId = Number(item.category.parentId);
            item.category.id = Number(item.category.id);
            api.url = '/items?' + querystring.stringify(params);
            api.body = item;
            delete item.postingSession;
            delete item.intent;
            delete item.token;
            dataAdapter.promiseRequest(req, api, done);
        }

        asynquence(callValidateItemCallback).or(errorPostingCallback)
            .then(postItem)
            .then(redirectToSuccessPostCallback);
    }

};
