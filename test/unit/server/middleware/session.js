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
                            session: {
                                data: _.clone(req.session.data)
                            },
                            app: {
                                session: _.clone(req.rendrApp.get('session')),
                                hasUpdateSession: !!req.rendrApp.updateSession,
                                hasGetSession: !!req.rendrApp.getSession,
                                getSession: {}
                            }
                        };
                        if (req.rendrApp.getSession) {
                            response.before.app.getSession = {
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
                            session: {
                                data: _.clone(req.session.data)
                            },
                            app: {
                                session: _.clone(req.rendrApp.get('session')),
                                hasUpdateSession: !!req.rendrApp.updateSession,
                                hasGetSession: !!req.rendrApp.getSession,
                                getSession: {}
                            }
                        };
                        if (req.rendrApp.getSession) {
                            response.after.app.getSession = {
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
                        })(before.app.session, after.app.session);

                        done();
                    });
                    it('should be req.session.data', function test(done) {
                        var before = response.body.before;
                        var after = response.body.after;

                        (function equality(appSession, sessionData) {
                            appSession.should.equal(sessionData);
                        })(JSON.stringify(after.app.session), JSON.stringify(after.session.data));

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
                        })(before.app.hasUpdateSession, after.app.hasUpdateSession);

                        done();
                    });
                    it("should add each Object's key/value pair to session.data", function test(done) {
                        var before = response.body.before;
                        var after = response.body.after;

                        (function existance(before, after) {
                            before.should.not.have.property('test');
                            after.should.have.property('test');
                        })(before.session.data || {}, after.session.data);

                        (function existance(before, after) {
                            before.should.not.have.property('test');
                            after.should.have.property('test');
                        })(before.app.session || {}, after.app.session);

                        (function equality(test) {
                            test.should.equal('test');
                        })(after.session.data.test);

                        (function equality(test) {
                            test.should.equal('test');
                        })(after.app.session.test);

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
                        })(before.app.hasGetSession, after.app.hasGetSession);

                        done();
                    });
                    it('should return session.data[String]', function test(done) {
                        var before = response.body.before;
                        var after = response.body.after;

                        (function existance(before, after) {
                            before.should.not.have.property('test');
                            after.should.have.property('test');
                        })(before.app.getSession, after.app.getSession);

                        (function equality(appTest, sessionTest) {
                            appTest.should.equal(sessionTest);
                        })(after.app.getSession.test, after.session.data.test);

                        done();
                    });
                    it('should return session.data if String is falsey', function test(done) {
                        var before = response.body.before;
                        var after = response.body.after;

                        (function existance(before, after) {
                            before.should.not.have.property('session');
                            after.should.have.property('session');
                        })(before.app.getSession, after.app.getSession);

                        (function equality(appSession, session) {
                            appSession.should.equal(session);
                        })(JSON.stringify(after.app.getSession.session), JSON.stringify(after.session.data));

                        done();
                    });
                });
            });
        });
    });
});
