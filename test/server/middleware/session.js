var should = require('should');
var request = require('supertest');
var express = require('express');
var rendr = require('rendr');
var SmaugAdapter = require('../../../server/data_adapter/smaug_adapter');
var dataAdapter = new SmaugAdapter();
var middleware = require('../../../server/middleware')(dataAdapter);

function expressConfiguration(app) {
    return function expressConfiguration() {
        app.use(express.cookieParser());
        app.use(express.session({
            secret: 'test'
        }));
    };
};

describe('server', function test() {
    describe('middleware', function test() {
        describe('session', function test() {
            it('should set session.data as the session attribute of req.rendrApp', function test(done) {
                var app = express();
                var server = rendr.createServer({
                    dataAdapter: dataAdapter
                });

                function rendrConfiguration(rendrApp) {
                    var response = {};

                    function before(req, res, next) {
                        req.session.data = {
                            test: 'test'
                        };
                        response.before = {
                            appSession: req.rendrApp.get('session')
                        };
                        next();
                    };

                    function after(req, res) {
                        response.after = {
                            sessionData: req.session.data,
                            appSession: req.rendrApp.get('session')
                        };
                        res.json(response);
                    };

                    rendrApp.use(before);
                    rendrApp.use(middleware.session());
                    rendrApp.use(after);
                };

                app.configure(expressConfiguration(app));
                server.configure(rendrConfiguration);
                app.use(server);

                request(app).get('/').end(end);

                function end(err, response) {
                    var before = response.body.before;
                    var after = response.body.after;

                    (function existance(before, after) {
                        should.not.exist(before);
                        should.exist(after);
                    })(before.appSession, after.appSession);

                    (function equality(appSession, sessionData) {
                        appSession.should.equal(sessionData);
                    })(JSON.stringify(after.appSession), JSON.stringify(after.sessionData));

                    done();
                };
            });
            it('should add an updateSession method to req.rendrApp', function test(done) {
                var app = express();
                var server = rendr.createServer({
                    dataAdapter: dataAdapter
                });

                function rendrConfiguration(rendrApp) {
                    var response = {};

                    function before(req, res, next) {
                        response.before = {
                            rendrApp: {
                                hasUpdateSession: !!req.rendrApp.updateSession
                            }
                        };
                        next();
                    };

                    function after(req, res) {
                        response.after = {
                            rendrApp: {
                                hasUpdateSession: !!req.rendrApp.updateSession
                            }
                        };
                        res.json(response);
                    };

                    rendrApp.use(before);
                    rendrApp.use(middleware.session());
                    rendrApp.use(after);
                };

                app.configure(expressConfiguration(app));
                server.configure(rendrConfiguration);
                app.use(server);

                request(app).get('/').end(end);

                function end(err, response) {
                    var before = response.body.before;
                    var after = response.body.after;

                    (function existance(before, after) {
                        before.should.not.be.ok;
                        after.should.be.ok;
                    })(before.rendrApp.hasUpdateSession, after.rendrApp.hasUpdateSession);

                    done();
                };
            });
            it('should add a getSession method to req.rendrApp', function test(done) {
                var app = express();
                var server = rendr.createServer({
                    dataAdapter: dataAdapter
                });

                function rendrConfiguration(rendrApp) {
                    var response = {};

                    function before(req, res, next) {
                        response.before = {
                            rendrApp: {
                                hasGetSession: !!req.rendrApp.getSession
                            }
                        };
                        next();
                    };

                    function after(req, res) {
                        response.after = {
                            rendrApp: {
                                hasGetSession: !!req.rendrApp.getSession
                            }
                        };
                        res.json(response);
                    };

                    rendrApp.use(before);
                    rendrApp.use(middleware.session());
                    rendrApp.use(after);
                };

                app.configure(expressConfiguration(app));
                server.configure(rendrConfiguration);
                app.use(server);

                request(app).get('/').end(end);

                function end(err, response) {
                    var before = response.body.before;
                    var after = response.body.after;

                    (function existance(before, after) {
                        before.should.not.be.ok;
                        after.should.be.ok;
                    })(before.rendrApp.hasGetSession, after.rendrApp.hasGetSession);

                    done();
                };
            });
            describe('req', function test() {
                describe('rendrApp', function test() {
                    describe('updateSession(Object)', function test() {
                        it ("should add each Object's key/value pair to session.data", function test(done) {
                            var app = express();
                            var server = rendr.createServer({
                                dataAdapter: dataAdapter
                            });

                            function rendrConfiguration(rendrApp) {
                                var response = {};

                                function before(req, res, next) {
                                    response.before = {
                                        sessionData: req.session.data || {}
                                    };
                                    next();
                                };

                                function after(req, res) {
                                    if (req.rendrApp.updateSession) {
                                        req.rendrApp.updateSession({
                                            test: 'test'
                                        });
                                    }
                                    response.after = {
                                        sessionData: req.session.data
                                    };
                                    res.json(response);
                                };

                                rendrApp.use(before);
                                rendrApp.use(middleware.session());
                                rendrApp.use(after);
                            };

                            app.configure(expressConfiguration(app));
                            server.configure(rendrConfiguration);
                            app.use(server);

                            request(app).get('/').end(end);

                            function end(err, response) {
                                var before = response.body.before;
                                var after = response.body.after;

                                (function existance(before, after) {
                                    should.not.exist(before);
                                    should.exist(after);
                                })(before.sessionData.test, after.sessionData.test);

                                (function equality(test) {
                                    test.should.equal('test');
                                })(after.sessionData.test);

                                done();
                            };
                        });
                    });
                    describe('getSession(String)', function test() {
                        it('should return session.data[String]', function test(done) {
                            var app = express();
                            var server = rendr.createServer({
                                dataAdapter: dataAdapter
                            });

                            function rendrConfiguration(rendrApp) {
                                var response = {};

                                function after(req, res) {
                                    var test;
                                    req.session.data.test = 'test';
                                    if (req.rendrApp.getSession) {
                                        test = req.rendrApp.getSession('test');
                                    }
                                    response = {
                                        session: {
                                            test: req.session.data.test
                                        },
                                        rendrApp: {
                                            test : test
                                        }
                                    };
                                    res.json(response);
                                };

                                rendrApp.use(middleware.session());
                                rendrApp.use(after);
                            };

                            app.configure(expressConfiguration(app));
                            server.configure(rendrConfiguration);
                            app.use(server);

                            request(app).get('/').end(end);

                            function end(err, response) {
                                var session = response.body.session;
                                var rendrApp = response.body.rendrApp;

                                (function existance(sessionTest, rendrAppTest) {
                                    should.exist(sessionTest);
                                    should.exist(rendrAppTest);
                                })(session.test, rendrApp.test);

                                (function equality(sessionTest, rendrAppTest) {
                                    sessionTest.should.equal(rendrAppTest);
                                })(session.test, rendrApp.test);

                                done();
                            };
                        });
                        it('should return session.data if !String', function test(done) {
                            var app = express();
                            var server = rendr.createServer({
                                dataAdapter: dataAdapter
                            });

                            function rendrConfiguration(rendrApp) {
                                var response = {};

                                function after(req, res) {
                                    var data;
                                    req.session.data.test = 'test';
                                    if (req.rendrApp.getSession) {
                                        data = req.rendrApp.getSession();
                                    }
                                    response = {
                                        session: {
                                            data: req.session.data
                                        },
                                        rendrApp: {
                                            data: data
                                        }
                                    };
                                    res.json(response);
                                };

                                rendrApp.use(middleware.session());
                                rendrApp.use(after);
                            };

                            app.configure(expressConfiguration(app));
                            server.configure(rendrConfiguration);
                            app.use(server);

                            request(app).get('/').end(end);

                            function end(err, response) {
                                var session = response.body.session;
                                var rendrApp = response.body.rendrApp;

                                (function existance(sessionData, rendrAppData) {
                                    should.exist(sessionData);
                                    should.exist(rendrAppData);
                                })(session.data, rendrApp.data);

                                (function equality(sessionData, rendrAppData) {
                                    sessionData.should.equal(rendrAppData);
                                })(JSON.stringify(session.data), JSON.stringify(rendrApp.data));

                                done();
                            };
                        });
                    });
                });
            });
        });
    });
});
