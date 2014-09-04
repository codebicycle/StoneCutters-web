'use strict';

var _ = require('underscore');
var should = require('should');
var request = require('supertest');
var express = require('express');
var rendr = require('rendr');
var SmaugAdapter = require('../../../shared/adapters/data');
var dataAdapter = new SmaugAdapter({
    userAgent: 'Arwen/mocha-test (node.js ' + process.version + ')'
});
var middleware = require('../../../server/middleware')(dataAdapter);
var Router = require('../../../server/router');

function expressConfiguration(app) {
    return function expressConfiguration() {
        app.use(express.cookieParser());
    };
}

describe('server', function test() {
    describe('middleware', function test() {
        describe('session', function test() {
            var server;
            var response;

            before(function before(done) {
                server = rendr.createServer({
                    dataAdapter: dataAdapter
                });
                var router = new Router(server);

                function rendrConfiguration(rendrApp) {
                    var response = {};

                    function after(req, res) {
                        req.rendrApp.session.update({
                            test: 'test'
                        });
                        response.after = {
                            session: _.clone(req.rendrApp.get('session')),
                            hasUpdateSession: !!req.rendrApp.session.update,
                            hasGetSession: !!req.rendrApp.session.get,
                            hasDeleteSession: !!req.rendrApp.session.clear,
                            hasPersistSession: !!req.rendrApp.session.update,
                            getSession: {}
                        };
                        if (req.rendrApp.session.get) {
                            response.after.getSession = {
                                session: req.rendrApp.session.get(),
                                test: req.rendrApp.session.get('test')
                            };
                        }
                        res.json(response);
                    }

                    rendrApp.use(middleware.session());
                    rendrApp.use(after);
                }

                server.expressApp.configure(expressConfiguration(server.expressApp));
                server.configure(rendrConfiguration);
                request(server.expressApp)
                    .get('/')
                    .end(end);

                function end(err, res) {
                    response = res;
                    done();
                }
            });
            describe('rendrApp', function test() {
                describe('.session', function test() {
                    it('should be added', function test(done) {
                        var after = response.body.after;

                        (function existance(after) {
                            should.exist(after);
                        })(after.session);

                        done();
                    });
                });
                describe('.session.update(Object)', function test() {
                    it('should be added', function test(done) {
                        var after = response.body.after;

                        (function existance(after, ok) {
                            ok = after.should.be.ok;
                        })(after.hasUpdateSession);

                        done();
                    });
                    it("should add each Object's key/value pair to session", function test(done) {
                        var after = response.body.after;

                        (function existance(after) {
                            after.should.have.property('test');
                        })(after.session);

                        (function equality(test) {
                            test.should.equal('test');
                        })(after.session.test);

                        done();
                    });
                });
                describe('.session.get(String)', function test() {
                    it('should be added', function test(done) {
                        var after = response.body.after;

                        (function existance(after, ok) {
                            ok = after.should.be.ok;
                        })(after.hasGetSession);

                        done();
                    });
                    it('should return session[String]', function test(done) {
                        var after = response.body.after;

                        (function existance(after) {
                            after.should.have.property('test');
                        })(after.getSession);

                        done();
                    });
                    it('should return session if String is falsey', function test(done) {
                        var after = response.body.after;

                        (function existance(after) {
                            after.should.have.property('session');
                        })(after.getSession);

                        done();
                    });
                });
            });
        });
    });
});
