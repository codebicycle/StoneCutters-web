'use strict';

var asynquence = require('asynquence');

module.exports = function itemRouter(app, dataAdapter) {
    var querystring = require('querystring');

    app.post('/post', postingHandler);

    function postingHandler(req, res) {
        var params = req.body;

        var item = {
            postingSession: req.param('postingSession', null),
            intent: req.param('intent', null),
            token: req.param('token', null),
            params: params,
        };

        delete params.postingSession;
        delete params.intent;
        delete params.token;

        function callValidateItemCallback(done) {
            validateItem(done, item);
        };

        function redirectToSuccessPostCallback(done, item) {
            //res.redirect('/post/success?itemId=' + item.id);
            res.redirect('/items/' + item.id);
        };

        function errorPostingCallback(err){
            console.log("err en callback: %j",err);
            var url = req.headers.referer;
            var qIndex = url.indexOf('?');
            if (qIndex != -1) {
                url = url.substring(0,qIndex);
            }
            console.log(url);
            res.redirect(url+'?' + querystring.stringify(err));
        };

        function validateItem(done, item) {
            console.log("en validate");
            var errors = {
                errCode: 400,
                err: [],
                errFields: []
            };
            if (!item.postingSession) {
                errors.err.push('Missing postingSession');
                errors.errFields.push('postingSession');
            }
            if (!item.intent) {
                errors.err.push('Missing intent');
                errors.errFields.push('intent');
            }
            if (!item.params) {
                errors.err.push('Missing params');
                errors.errFields.push('params');
            }
            if (!item.params.title) {
                errors.err.push('Missing title');
                errors.errFields.push('title');
            }
            if (!item.params.description) {
                errors.err.push('Missing description');
                errors.errFields.push('description');
            }
            if (item.params.category) {
                if (!item.params.category.parentId) {
                    errors.err.push('Missing category.parentId');
                    errors.errFields.push('category.parentId');
                }
                if (!item.params.category.id) {
                    errors.err.push('Missing category.id');
                    errors.errFields.push('category.id');
                }
            }
            if (!item.params.location) {
                errors.err.push('Missing location');
                errors.errFields.push('location');
            }
            if (!item.params.email) {
                errors.err.push('Missing email');
                errors.errFields.push('email');
            }
            if (!item.params.platform) {
                errors.err.push('Missing platform');
                errors.errFields.push('platform');
            }
            if (!item.params.languageId) {
                errors.err.push('Missing languageId');
                errors.errFields.push('languageId');
            }
            if (!item.params.languageCode) {
                errors.err.push('Missing languageCode');
                errors.errFields.push('languageCode');
            }
            if (!item.params.postingSession) {
                errors.err.push('Missing postingSession');
                errors.errFields.push('postingSession');
            }
            if (!item.params.priceType) {
                errors.err.push('Missing priceType');
                errors.errFields.push('priceType');
            }
            if (errors.err.length) {
                console.log("err en validate: %j",errors);
                done.fail(errors);
                return;
            }
            console.log("saliendo validate");
            done(item);
        };

        function postItem(done, item) {
            var api = {
                method: 'POST',
                url: '/items',
                params: item
            };

            dataAdapter.promiseRequest(req, api, done);
        };

        asynquence(callValidateItemCallback).or(errorPostingCallback)
            .then(postItem)
            .then(redirectToSuccessPostCallback);
    };

};
