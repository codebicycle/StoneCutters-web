'use strict';


var _ = require('underscore');
var should = require('should');
var request = require('supertest');
var express = require('express');
var rendr = require('rendr');

var utils = require('../../../utils');
var SmaugAdapter = require('../../../../shared/adapters/data');
var dataAdapter = new SmaugAdapter({
    userAgent: utils.smaugUserAgent
});
var middleware = require('../../../../server/middleware')(dataAdapter);
var helpers = require('../../../../app/helpers');
var Router = require('../../../../server/router');

function expressConfiguration(app) {
    return function expressConfiguration() {
        app.use(express.compress());
        app.use(express.cookieParser());
    };
}

describe('server', function test() {
    describe('router', function test() {
        describe('users', function test() {
            var server;
            var response;
            var sessions = {};

            describe('login', function test() {
                before(function before(done) {
                    server = rendr.createServer({
                        dataAdapter: dataAdapter,
                        viewsPath: 'app/localized/common/app/views'
                    });
                    var router = new Router(server);

                    function rendrConfiguration(rendrApp) {
                        rendrApp.use(middleware.platform());
                        rendrApp.use(middleware.session());
                        rendrApp.use(middleware.abSelector());
                        rendrApp.use(middleware.environment());
                        rendrApp.use(middleware.location());
                        rendrApp.use(middleware.languages());
                        rendrApp.use(middleware.templates());
                        rendrApp.use(afterMiddleware);
                    }

                    function afterMiddleware(req, res, next) {
                        if (!sessions.before) {
                            sessions.before = _.clone(req.rendrApp.session.get());
                        }
                        else {
                            sessions.after = _.clone(req.rendrApp.session.get());
                        }
                        next();
                    }

                    server.expressApp.configure(expressConfiguration(server.expressApp));
                    server.configure(rendrConfiguration);
                    router.route();
                    request(server.expressApp)
                        .post('/login')
                        .send({
                            usernameOrEmail: 'damianb@olx.com',
                            password: 'dami21'
                        })
                        .set('host', utils.getHost('html4', 'ar'))
                        .set('user-agent', utils.userAgents.html4)
                        .end(end);

                    function end(err, res) {
                        response = res;
                        done();
                    }
                });
                it('should not exists the user in the session', function test(done) {
                    (function existance(before) {
                        before.should.not.have.property('user');
                    })(sessions.before);
                    done();
                });
                it('should be added the user to the session', function test(done) {
                    request(server.expressApp)
                        .get('/')
                        .set('host', utils.getHost('html4', 'ar'))
                        .set('user-agent', utils.userAgents.html4)
                        .set('cookie', response.get('set-cookie'))
                        .end(end);

                    function end(err, res) {
                        (function existance(after) {
                            after.should.have.property('user');
                        })(sessions.after);
                        done();
                    }
                });
            });
        });
    });
});
