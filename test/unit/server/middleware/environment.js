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
var paths = {
    '/': 'home',
    '/items': 'listing',
    '/items/.*': 'listing',
    '/interstitial': 'interstitial',
    '/categories': 'categoryList',
    '/api/.*': 'api'
};
var Router = require('../../../../server/router');

function expressConfiguration(app) {
    return function expressConfiguration() {
        app.use(express.cookieParser());
    };
}

describe('server', function test() {
    describe('middleware', function test() {
        describe('environment', function test() {
            var server;
            var response;

            before(function before(done) {
                server = rendr.createServer({
                    dataAdapter: dataAdapter
                });
                var router = new Router(server);

                function rendrConfiguration(rendrApp) {
                    var response = {};

                    function before(req, res, next) {
                        response.before = {
                            host: req.headers.host,
                            pathname: req._parsedUrl.pathname,
                            originalUrl: req.originalUrl,
                            session: _.clone(req.rendrApp.session.get())
                        };
                        next();
                    }

                    function after(req, res) {
                        response.after = {
                            host: req.headers.host,
                            pathname: req._parsedUrl.pathname,
                            originalUrl: req.originalUrl,
                            session: _.clone(req.rendrApp.session.get())
                        };
                        res.json(response);
                    }

                    rendrApp.use(middleware.session());
                    rendrApp.use(before);
                    rendrApp.use(middleware.environment());
                    rendrApp.use(after);
                }

                server.expressApp.configure(expressConfiguration(server.expressApp));
                server.configure(rendrConfiguration);
                request(server.expressApp)
                    .get('/')
                    .set('host', 'm.olx.com.ar')
                    .end(end);

                function end(err, res) {
                    response = res;
                    done();
                }
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
            describe('platform', function test() {
                it('should be added to the session', function test(done) {
                    var before = response.body.before;
                    var after = response.body.after;

                    (function existance(before, after) {
                        before.should.not.have.property('platform');
                        after.should.have.property('platform');
                    })(before.session, after.session);

                    done();
                });
            });
        });
    });
});
