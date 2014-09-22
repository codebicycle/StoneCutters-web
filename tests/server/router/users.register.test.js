'use strict';

var User;
var formidable;
var app;
var utils;
var users;
var req;
var res;

describe('server', function() {
    describe('router', function() {
        describe('users', function() {
            describe('.register', function() {
                beforeEach(reset);
                test();
            });
        });
    });
});

function reset() {
    User = function() {};
    formidable = {};
    app = {
        post: function() {}
    };
    utils = {};
    req = {
        rendrApp: {
            session: {}
        }
    };
    res = {};
    users = proxyquire('../server/router/users', {
        '../../app/models/user': User,
        '../modules/formidable': formidable,
        '../../shared/utils': utils
    })(app);
}

function test() {

}

function mock(data) {

}

function success(done, assert, credentials) {

}

function fail(done, assert, credentials) {

}
