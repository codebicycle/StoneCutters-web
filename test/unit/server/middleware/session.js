'use strict';

var _ = require('underscore');
var should = require('should');
var request = require('supertest');
var express = require('express');
var rendr = require('rendr');
var SmaugAdapter = require('../../../../shared/adapters/data');
var dataAdapter = new SmaugAdapter({
    userAgent: 'Arwen/mocha-test (node.js ' + process.version + ')'
});
var middleware = require('../../../../server/middleware')(dataAdapter);

function expressConfiguration(app) {
    return function expressConfiguration() {
        app.use(express.cookieParser());
    };
}

describe('server', function test() {
    describe('middleware', function test() {
        describe('session', function test() {
            var app;
            var response;

            before(function before(done) {
                app = express();
                var server = rendr.createServer({
                    dataAdapter: dataAdapter
                });

                function rendrConfiguration(rendrApp) {
                    var response = {};

                    function before(req, res, next) {
                        response.before = {
                            session: _.clone(req.rendrApp.get('session')),
                            hasUpdateSession: !!req.rendrApp.updateSession,
                            hasGetSession: !!req.rendrApp.getSession,
                            getSession: {}
                        };
                        if (req.rendrApp.getSession) {
                            response.before.getSession = {
                                session: req.rendrApp.getSession(),
                                test: req.rendrApp.getSession('test')
                            };
                        }
                        next();
                    }

                    function after(req, res) {
                        req.rendrApp.updateSession({
                            test: 'test'
                        });
                        response.after = {
                            session: _.clone(req.rendrApp.get('session')),
                            hasUpdateSession: !!req.rendrApp.updateSession,
                            hasGetSession: !!req.rendrApp.getSession,
                            hasDeleteSession: !!req.rendrApp.deleteSession,
                            hasPersistSession: !!req.rendrApp.persistSession,
                            getSession: {}
                        };
                        if (req.rendrApp.getSession) {
                            response.after.getSession = {
                                session: req.rendrApp.getSession(),
                                test: req.rendrApp.getSession('test')
                            };
                        }
                        res.json(response);
                    }

                    rendrApp.use(before);
                    rendrApp.use(middleware.session());
                    rendrApp.use(after);
                }

                app.configure(expressConfiguration(app));
                server.configure(rendrConfiguration);
                app.use(server);
                request(app)
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
                        var before = response.body.before;
                        var after = response.body.after;

                        (function existance(before, after) {
                            should.not.exist(before);
                            should.exist(after);
                        })(before.session, after.session);

                        done();
                    });
                });
                describe('.updateSession(Object)', function test() {
                    it('should be added', function test(done) {
                        var before = response.body.before;
                        var after = response.body.after;

                        (function existance(before, after, ok) {
                            ok = before.should.not.be.ok;
                            ok = after.should.be.ok;
                        })(before.hasUpdateSession, after.hasUpdateSession);

                        done();
                    });
                    it("should add each Object's key/value pair to session", function test(done) {
                        var before = response.body.before;
                        var after = response.body.after;

                        (function existance(before, after) {
                            before.should.not.have.property('test');
                            after.should.have.property('test');
                        })(before.session || {}, after.session);

                        (function equality(test) {
                            test.should.equal('test');
                        })(after.session.test);

                        done();
                    });
                });
                describe('.getSession(String)', function test() {
                    it('should be added', function test(done) {
                        var before = response.body.before;
                        var after = response.body.after;

                        (function existance(before, after, ok) {
                            ok = before.should.not.be.ok;
                            ok = after.should.be.ok;
                        })(before.hasGetSession, after.hasGetSession);

                        done();
                    });
                    it('should return session[String]', function test(done) {
                        var before = response.body.before;
                        var after = response.body.after;

                        (function existance(before, after) {
                            before.should.not.have.property('test');
                            after.should.have.property('test');
                        })(before.getSession, after.getSession);

                        done();
                    });
                    it('should return session if String is falsey', function test(done) {
                        var before = response.body.before;
                        var after = response.body.after;

                        (function existance(before, after) {
                            before.should.not.have.property('session');
                            after.should.have.property('session');
                        })(before.getSession, after.getSession);

                        done();
                    });
                });
            });
        });
    });
});
