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
var Router = require('../../../../server/router');

function expressConfiguration(app) {
    return function expressConfiguration() {
        app.use(express.compress());
        app.use(express.cookieParser());
    };
}

describe('server', function test() {
    describe('middleware', function test() {
        describe('location', function test() {
            var server;
            var response;
            var after;

            before(function before(done) {
                server = rendr.createServer({
                    dataAdapter: dataAdapter
                });
                var router = new Router(server);

                function rendrConfiguration(rendrApp) {
                    var response = {};

                    function before(req, res, next) {
                        response.before = {
                            session: _.clone(req.rendrApp.session.get())
                        };
                        next();
                    }

                    function after(req, res) {
                        response.after = {
                            session: _.clone(req.rendrApp.session.get())
                        };
                        res.json(response);
                    }

                    rendrApp.use(middleware.platform());
                    rendrApp.use(middleware.session());
                    rendrApp.use(middleware.abSelector());
                    rendrApp.use(middleware.environment());
                    rendrApp.use(before);
                    rendrApp.use(middleware.location());
                    rendrApp.use(after);
                }

                server.expressApp.configure(expressConfiguration(server.expressApp));
                server.configure(rendrConfiguration);
                request(server.expressApp)
                    .get('/')
                    .set('host', utils.getHost('html5', 'ar'))
                    .set('user-agent', utils.userAgents.html5)
                    .end(end);

                function end(err, res) {
                    response = res;
                    done();
                }
            });
            it('should be added to the session', function test(done) {
                var before = response.body.before;

                after = response.body.after;

                (function existance(before, after) {
                    before.should.not.have.property('location');
                    after.should.have.property('location');
                })(before.session, after.session);

                done();
            });
            it('should be the same for the same host', function test(done) {
                request(server.expressApp)
                    .get('/')
                    .set('host', utils.getHost('html5', 'ar'))
                    .set('user-agent', utils.userAgents.html5)
                    .set('cookie', response.get('set-cookie'))
                    .end(end);

                function end(err, response) {
                    var newAfter = response.body.after;

                    (function equality(before, after) {
                        before.should.equal(after);
                    })(JSON.stringify(after.session.location), JSON.stringify(newAfter.session.location));
                    done();
                }
            });
            it('should be different for different hosts', function test(done) {
                request(server.expressApp)
                    .get('/?location=' + utils.locations.in.www)
                    .set('host', utils.getHost('html5', 'in'))
                    .set('user-agent', utils.userAgents.html5)
                    .set('cookie', response.get('set-cookie'))
                    .end(next);

                function next(err, response) {
                    request(server.expressApp)
                        .get('/')
                        .set('host', utils.getHost('html5', 'in'))
                        .set('user-agent', utils.userAgents.html5)
                        .set('cookie', response.get('set-cookie'))
                        .end(end);

                    function end(err, response) {
                        var newAfter = response.body.after;

                        (function equality(before, after) {
                            before.should.not.equal(after);
                        })(JSON.stringify(after.session.location), JSON.stringify(newAfter.session.location));

                        done();
                    }
                }
            });
            describe('topCities', function test() {
                it('should be added', function test(done) {
                    var before = response.body.before;
                    var after = response.body.after;

                    (function existance(before, after) {
                        before.should.not.have.property('topCities');
                        after.should.have.property('topCities');
                    })(before.session.location || {}, after.session.location);

                    done();
                });
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
                        siteLocation.should.endWith(host.substr(host.indexOf('m.') + 2));
                    })(after.session.siteLocation, after.session.host);

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
        });
    });
});
