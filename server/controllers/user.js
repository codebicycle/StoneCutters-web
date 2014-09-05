'use strict';

module.exports = {
    register: register,
    login: login
}

function register() {

}

function login(credentials, platform, callback) {
    asynquence().or(callback.fail)
        .then(getChallenge)
        .then(submit)
        .then(callback)

    function getChallenge(done) {
        dataAdapter.get(req, '/users/challenge', {
            query: {
                u: credentials.usernameOrEmail,
                platform: platform
            }
        }, done.errfcb);
    }

    function submit(done, credentials) {
        var hash = crypto.createHash('md5').update(credentials.password).digest('hex');

        dataAdapter.get(req, '/users/login', {
            query: {
                c: data.challenge,
                h: crypto.createHash('sha512').update(hash + usernameOrEmail).digest('hex'),
                platform: platform
            }
        }, done.errfcb);
    }
}
