'use strict';

var _ = require('underscore');
var should = require('should');
var request = require('supertest');
var express = require('express');
var rendr = require('rendr');
var SmaugAdapter = require('../../../server/data_adapter/smaug_adapter');
var dataAdapter = new SmaugAdapter({
    userAgent: 'Arwen/mocha-test (node.js ' + process.version + ')'
});
var middleware = require('../../../server/middleware')(dataAdapter);
var paths = {
    '/': 'home',
    '/items': 'listing',
    '/items/.*': 'listing',
    '/interstitial': 'interstitial',
    '/categories': 'categoryList',
    '/api/.*': 'api'
};

function expressConfiguration(app) {
    return function expressConfiguration() {
        app.use(express.cookieParser());
        app.use(express.session({
            store: require('../../../store')(express),
            secret: 'test'
        }));
    };
}

describe('server', function test() {
    describe('middleware', function test() {
        describe('environment', function test() {
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
                            host: req.headers.host,
                            pathname: req._parsedUrl.pathname,
                            originalUrl: req.originalUrl,
                            session: _.clone(req.rendrApp.getSession())
                        };
                        next();
                    }

                    function after(req, res) {
                        response.after = {
                            host: req.headers.host,
                            pathname: req._parsedUrl.pathname,
                            originalUrl: req.originalUrl,
                            session: _.clone(req.rendrApp.getSession())
                        };
                        res.json(response);
                    }

                    rendrApp.use(middleware.session());
                    rendrApp.use(before);
                    rendrApp.use(middleware.environment());
                    rendrApp.use(after);
                }

                app.configure(expressConfiguration(app));
                server.configure(rendrConfiguration);
                app.use(server);
                request(app)
                    .get('/')
                    .set('host', 'm.olx.com.ar')
                    .end(end);

                function end(err, res) {
                    response = res;
                    done();
                }
            });
            describe('siteLocation', function test() {
                it('should be added to the session', function test(done) {
                    var before = response.body.before;
                    var after = response.body.after;

                    (function existance(before, after) {
                        before.should.not.have.property('siteLocation');
                        after.should.have.property('siteLocation');
                    })(before.session, after.session);

                    done();
                });
                it('should be equal to the host', function test(done) {
                    var before = response.body.before;
                    var after = response.body.after;

                    (function equality(siteLocation, host) {
                        siteLocation.should.equal(host);
                    })(after.session.siteLocation, after.host);

                    done();
                });
                it('should start with "www."', function test(done) {
                    var before = response.body.before;
                    var after = response.body.after;

                    (function validity(subdomain) {
                        subdomain.should.equal('www');
                    })(after.session.siteLocation.split('.')[0]);

                    done();
                });
            });
            describe('path', function test() {
                it('should be added to the session', function test(done) {
                    var before = response.body.before;
                    var after = response.body.after;

                    (function existance(before, after) {
                        before.should.not.have.property('path');
                        after.should.have.property('path');
                    })(before.session, after.session);

                    done();
                });
                it('should be equal to the pathname', function test(done) {
                    var before = response.body.before;
                    var after = response.body.after;

                    (function equality(path, pathname) {
                        path.should.equal(pathname);
                    })(after.session.path, after.pathname);

                    done();
                });
            });
            describe('url', function test() {
                it('should be added to the session', function test(done) {
                    var before = response.body.before;
                    var after = response.body.after;

                    (function existance(before, after) {
                        before.should.not.have.property('url');
                        after.should.have.property('url');
                    })(before.session, after.session);

                    done();
                });
                it('should be equal to the original url', function test(done) {
                    var before = response.body.before;
                    var after = response.body.after;

                    (function equality(url, originalUrl) {
                        url.should.equal(originalUrl);
                    })(after.session.url, after.originalUrl);

                    done();
                });
            });
            describe('viewType', function test() {
                it('should be added to the session', function test(done) {
                    var before = response.body.before;
                    var after = response.body.after;

                    (function existance(before, after) {
                        before.should.not.have.property('viewType');
                        after.should.have.property('viewType');
                    })(before.session, after.session);

                    done();
                });
                for (var path in paths) {
                    closure(path);
                }
                function closure(path) {
                    it('should be "' + paths[path] + '" if path is ' + path, function test(done) {
                        request(app)
                            .get(path)
                            .set('host', 'm.olx.com.ar')
                            .end(end);

                        function end(err, response) {
                            var before = response.body.before;
                            var after = response.body.after;

                            (function equality(viewType) {
                                viewType.should.equal(paths[path]);
                            })(after.session.viewType);

                            done();
                        }
                    });
                }
            });
        });
    });
});
