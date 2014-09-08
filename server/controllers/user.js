'use strict';

var crypto = require('crypto');
var asynquence = require('asynquence');
var DataAdapter = require('../../shared/adapters/data');
var config = require('../config');
var dataAdapter = new DataAdapter({
    userAgent: 'Arwen/' + config.get('environment', 'development') + ' (node.js ' + process.version + ')'
});

module.exports = {
    login: login,
    register: register
}

function login(done, req, credentials) {
    var platform = req.rendrApp.session.get('platform');

    asynquence().or(done.fail)
        .then(getChallenge)
        .val(submit);

    function getChallenge(done) {
        dataAdapter.get(req, '/users/challenge', {
            query: {
                u: credentials.usernameOrEmail,
                platform: platform
            }
        }, done.errfcb);
    }

    function submit(data) {
        var hash = crypto.createHash('md5').update(credentials.password || '').digest('hex');

        dataAdapter.get(req, '/users/login', {
            query: {
                c: data.challenge,
                h: crypto.createHash('sha512').update(hash + credentials.usernameOrEmail).digest('hex'),
                platform: platform
            }
        }, done.errfcb);
    }
}

function register(done, req, data) {
    asynquence().or(done.fail)
        .val(submit);

    function submit() {
        data.location = req.rendrApp.session.get('siteLocation');
        data.languageId = req.rendrApp.session.get('languages')._byId[req.rendrApp.session.get('selectedLanguage')].id;
        dataAdapter.post(req, '/users', {
            query: {
                platform: req.rendrApp.session.get('platform')
            },
            data: data
        }, done.errfcb);
    }
}
