'use strict';

var asynquence = require('asynquence');
var multipart = require('connect-multiparty');
var express = require('express');

module.exports = function itemRouter(app, dataAdapter) {
    var querystring = require('querystring');

    app.use(express.bodyParser());
    app.post('/post', postingHandler);
    app.post('/items/:itemId/reply', replyHandler);

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
        var item = req.body;
        var images = req.files.images[0];
        
        console.log(images);
        

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
            

            item.priceC = Number(item.priceC);
            item.category.parentId = Number(item.category.parentId);
            item.category.id = Number(item.category.id);
            var api = {
                method: 'POST',
                url: '/items?' + querystring.stringify({postingSession:item.postingSession,intent:'validate',languageCode:item.languageCode}),
                body: item
            };

            function success(results) {
                done(item);
            }

            dataAdapter.promiseRequest(req, api, success, done.fail);

        }

        function postImages(done, item) {
            var posts = asynquence().or(done.fail);
            var callbaks = [];

            function success() {
                console.log('----------------------', arguments);
                done(arguments);
            }

            if (!Array.isArray(images)) {
                images = [images];
            }
            images.forEach(function each(image) {
                function post(done) {
                    var api = {
                        method: 'POST',
                        url: '/images?' + querystring.stringify({postingSession:item.postingSession}),
                        body: image.path
                    };
                    console.log(api);
                    dataAdapter.promiseRequest(req, api, done);
                }
                callbaks.push(post);
            });
            posts.gate.apply(posts, callbaks).val(success);
        }

        function postItem(done, item) {
            var api = {
                method: 'POST',
                url: '/items?' + querystring.stringify({postingSession:item.postingSession,intent:item.intent}),
                body: item
            };

            delete item.postingSession;
            delete item.intent;
            delete item.token;
            dataAdapter.promiseRequest(req, api, done);
        }

        asynquence(callValidateItemCallback).or(errorPostingCallback)
            .then(postImages)
            .then(postItem)
            .then(redirectToSuccessPostCallback);
    }

};
