'use strict';

var asynquence = require('asynquence');

module.exports = function itemRouter(app, dataAdapter) {
    var querystring = require('querystring');

    app.post('/post', postingHandler);

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
            .then(postItem)
            .then(redirectToSuccessPostCallback);
    }

};
