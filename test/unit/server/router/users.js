'use strict';

var _ = require('underscore');
var should = require('should');
var request = require('supertest');
var express = require('express');
var rendr = require('rendr');
var SmaugAdapter = require('../../../../server/adapter/data');
var dataAdapter = new SmaugAdapter({
    userAgent: 'Arwen/mocha-test (node.js ' + process.version + ')'
});
var middleware = require('../../../../server/middleware')(dataAdapter);
var hosts = ['m.olx.com.ar', 'm.olx.com.br'];
var userAgents = ['UCWEB/8.8 (iPhone; CPU OS_6; en-US)AppleWebKit/534.1 U3/3.0.0 Mobile', 'Mozilla/4.0 (compatible; MSIE 7.0; Windows Phone OS 7.0; Trident/3.1; IEMobile/7.0) Asus;Galaxy6', 'Nokia6100/1.0 (04.01) Profile/MIDP-1.0 Configuration/CLDC-1.0'];

function expressConfiguration(app) {
    return function expressConfiguration() {
        app.use(express.cookieParser());
        app.use(express.session({
            store: require('../../../../server/memcached')(express),
            secret: 'test'
        }));
    };
}

describe('server', function test() {
    describe('router', function test() {
        describe('users', function test() {
            var app;
            var response;
            var sessions = {};

            describe('login', function test() {
                before(function before(done) {
                    app = express();
                    var server = rendr.createServer({
                        dataAdapter: dataAdapter
                    });

                    function rendrConfiguration(rendrApp) {
                        function after(req, res, next) {
                            if (!sessions.before) {
                                sessions.before = _.clone(req.rendrApp.getSession());
                            }
                            else {
                                sessions.after = _.clone(req.rendrApp.getSession());
                            }
                            next();
                        }

                        rendrApp.use(middleware.session());
                        rendrApp.use(middleware.environment());
                        rendrApp.use(middleware.templates());
                        rendrApp.use(middleware.categories());
                        rendrApp.use(middleware.location());
                        rendrApp.use(middleware.languages());
                        rendrApp.use(after);
                    }

                    app.configure(expressConfiguration(app));
                    server.configure(rendrConfiguration);
                    app.use(server);
                    require('../../../../server/router')(app, dataAdapter);
                    request(app)
                        .post('/login')
                        .send({
                            usernameOrEmail: 'nicolas.molina@olx.com',
                            password: 'Milo2004'
                        })
                        .set('host', hosts[0])
                        .set('user-agent', userAgents[0])
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
                    request(app)
                        .get('/')
                        .set('host', hosts[1])
                        .set('user-agent', userAgents[0])
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

            describe('logout', function test() {
                it('should not exists the user in the session', function test(done) {
                    request(app)
                        .get('/logout')
                        .set('host', hosts[1])
                        .set('user-agent', userAgents[0])
                        .set('cookie', response.get('set-cookie'))
                        .end(next);

                    function next(err, res) {
                        request(app)
                            .get('/')
                            .set('host', hosts[1])
                            .set('user-agent', userAgents[0])
                            .set('cookie', res.get('set-cookie'))
                            .end(end);
                    }

                    function end(err, res) {
                        (function existance(after) {
                            after.should.not.have.property('user');
                        })(sessions.after);
                        done();
                    }
                });
            });
        });
    });
});