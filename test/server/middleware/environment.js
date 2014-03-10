var should = require('should');
var request = require('supertest');
var express = require('express');
var rendr = require('rendr');
var SmaugAdapter = require('../../../server/data_adapter/smaug_adapter');
var dataAdapter = new SmaugAdapter();
var middleware = require('../../../server/middleware')(dataAdapter);
var asynquence = require('asynquence');

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
        describe('environment', function test() {
            it('should add the www host to the session as the siteLocation attribute', function test(done) {
                var app = express();
                var server = rendr.createServer({
                    dataAdapter: dataAdapter
                });

                function rendrConfiguration(rendrApp) {
                    var response = {};

                    function before(req, res, next) {
                        response.before = {
                            host: req.headers.host,
                            siteLocation: req.rendrApp.getSession('siteLocation')
                        };
                        next();
                    };

                    function after(req, res) {
                        response.after = {
                            host: req.headers.host,
                            siteLocation: req.rendrApp.getSession('siteLocation')
                        };
                        res.json(response);
                    };
                    rendrApp.use(middleware.session());
                    rendrApp.use(before);
                    rendrApp.use(middleware.environment());
                    rendrApp.use(after);
                };

                app.configure(expressConfiguration(app));
                server.configure(rendrConfiguration);
                app.use(server);

                request(app).get('/').set('host', 'm.olx.com.ar').end(end);

                function end(err, response) {
                    var before = response.body.before;
                    var after = response.body.after;

                    (function existance(before, after) {
                        should.not.exist(before);
                        should.exist(after);
                    })(before.siteLocation, after.siteLocation);

                    (function validity(subdomain) {
                        subdomain.should.equal('www');
                    })(after.host.split('.')[0]);

                    (function equality(siteLocation, host) {
                        siteLocation.should.equal(host);
                    })(after.host, after.siteLocation);

                    done();
                };
            });
            it('should add the pathname to the session as the path attribute', function test(done) {
                var app = express();
                var server = rendr.createServer({
                    dataAdapter: dataAdapter
                });

                function rendrConfiguration(rendrApp) {
                    var response = {};

                    function before(req, res, next) {
                        response.before = {
                            pathname: req._parsedUrl.pathname,
                            path: req.rendrApp.getSession('path')
                        };
                        next();
                    };

                    function after(req, res) {
                        response.after = {
                            pathname: req._parsedUrl.pathname,
                            path: req.rendrApp.getSession('path')
                        };
                        res.json(response);
                    };
                    rendrApp.use(middleware.session());
                    rendrApp.use(before);
                    rendrApp.use(middleware.environment());
                    rendrApp.use(after);
                };

                app.configure(expressConfiguration(app));
                server.configure(rendrConfiguration);
                app.use(server);

                request(app).get('/').set('host', 'm.olx.com.ar').end(end);

                function end(err, response) {
                    var before = response.body.before;
                    var after = response.body.after;

                    (function existance(before, after) {
                        should.not.exist(before);
                        should.exist(after);
                    })(before.path, after.path);

                    (function equality(path, pathname) {
                        path.should.equal(pathname);
                    })(after.path, after.pathname);

                    done();
                };
            });
            it('should add the view type to the session as the viewType attribute', function test(done) {
                var app = express();
                var server = rendr.createServer({
                    dataAdapter: dataAdapter
                });

                function rendrConfiguration(rendrApp) {
                    var response = {};

                    function before(req, res, next) {
                        response.before = {
                            viewType: req.rendrApp.getSession('viewType')
                        };
                        next();
                    };

                    function after(req, res) {
                        response.after = {
                            viewType: req.rendrApp.getSession('viewType')
                        };
                        res.json(response);
                    };
                    rendrApp.use(middleware.session());
                    rendrApp.use(before);
                    rendrApp.use(middleware.environment());
                    rendrApp.use(after);
                };

                app.configure(expressConfiguration(app));
                server.configure(rendrConfiguration);
                app.use(server);

                var paths = {
                    '/': 'home',
                    '/items': 'listing',
                    '/items/1': 'itemPage',
                    '/test': 'unknown'
                };
                var requests = asynquence(function start(done) {
                    done(request(app));
                });
                for (var path in paths) {
                    (function closure(path) {
                        requests.then(function then(done, request) {
                            request.get(path).set('host', 'm.olx.com.ar').end(end);

                            function end(err, response) {
                                var before = response.body.before;
                                var after = response.body.after;

                                (function existance(before, after) {
                                    should.not.exist(before);
                                    should.exist(after);
                                })(before.viewType, after.viewType);

                                (function equality(viewType) {
                                    viewType.should.equal(paths[path]);
                                })(after.viewType);

                                done(request);
                            };
                        });
                    })(path);
                }
                requests.val(function end() {
                    done();
                });
            });
            it('should add the originalUrl to the session as the url attribute', function test(done) {
                var app = express();
                var server = rendr.createServer({
                    dataAdapter: dataAdapter
                });

                function rendrConfiguration(rendrApp) {
                    var response = {};

                    function before(req, res, next) {
                        response.before = {
                            originalUrl: req.originalUrl,
                            url: req.rendrApp.getSession('url')
                        };
                        next();
                    };

                    function after(req, res) {
                        response.after = {
                            originalUrl: req.originalUrl,
                            url: req.rendrApp.getSession('url')
                        };
                        res.json(response);
                    };
                    rendrApp.use(middleware.session());
                    rendrApp.use(before);
                    rendrApp.use(middleware.environment());
                    rendrApp.use(after);
                };

                app.configure(expressConfiguration(app));
                server.configure(rendrConfiguration);
                app.use(server);

                request(app).get('/').set('host', 'm.olx.com.ar').end(end);

                function end(err, response) {
                    var before = response.body.before;
                    var after = response.body.after;

                    (function existance(before, after) {
                        should.not.exist(before);
                        should.exist(after);
                    })(before.url, after.url);

                    (function equality(url, originalUrl) {
                        url.should.equal(originalUrl);
                    })(after.url, after.originalUrl);

                    done();
                };
            });
        });
    });
});
