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
            var url = req.headers.referer;
            var qIndex = url.indexOf('?');

            if (qIndex != -1) {
                url = url.substring(0,qIndex);
            }
            res.redirect(url+'?' + querystring.stringify(err));
        }

        function validateItem(done, item) {
            var errors = {
                errCode: 400,
                err: [],
                errFields: []
            };

            item.priceC = Number(item.priceC);
            if (!item.postingSession) {
                errors.err.push('Missing postingSession');
                errors.errFields.push('postingSession');
            }
            if (!item.intent) {
                errors.err.push('Missing intent');
                errors.errFields.push('intent');
            }
            if (!item.title) {
                errors.err.push('Missing title');
                errors.errFields.push('title');
            }
            if (!item.description) {
                errors.err.push('Missing description');
                errors.errFields.push('description');
            }
            if (!item.category) {
                errors.err.push('Missing category');
                errors.errFields.push('category');
            }
            else {
                if (!item.category.parentId) {
                    errors.err.push('Missing category.parentId');
                    errors.errFields.push('category.parentId');
                }
                else {
                    item.category.parentId = Number(item.category.parentId);
                }
                if (!item.category.id) {
                    errors.err.push('Missing category.id');
                    errors.errFields.push('category.id');
                }
                else {
                    item.category.id = Number(item.category.id);
                }
            }
            if (!item.location) {
                errors.err.push('Missing location');
                errors.errFields.push('location');
            }
            if (!item.email) {
                errors.err.push('Missing email');
                errors.errFields.push('email');
            }
            if (!item.platform) {
                errors.err.push('Missing platform');
                errors.errFields.push('platform');
            }
            if (!item.languageId) {
                errors.err.push('Missing languageId');
                errors.errFields.push('languageId');
            }
            if (errors.err.length) {
                console.log("err en validate: %j",errors);
                done.fail(errors);
                return;
            }
            done(item);
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
