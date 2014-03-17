'use strict';

var _ = require('underscore');
var should = require('should');
var request = require('supertest');
var express = require('express');
var rendr = require('rendr');
var SmaugAdapter = require('../../../server/data_adapter/smaug_adapter');
var dataAdapter = new SmaugAdapter();
var middleware = require('../../../server/middleware')(dataAdapter);
var hosts = ['m.olx.com.ar', 'm.olx.com.br'];
var userAgents = ['UCWEB/8.8 (iPhone; CPU OS_6; en-US)AppleWebKit/534.1 U3/3.0.0 Mobile', 'Mozilla/4.0 (compatible; MSIE 7.0; Windows Phone OS 7.0; Trident/3.1; IEMobile/7.0) Asus;Galaxy6'];

function expressConfiguration(app) {
    return function expressConfiguration() {
        app.use(express.cookieParser());
        app.use(express.session({
            store: null,
            secret: 'test'
        }));
    };
};

describe('server', function test() {
    describe('middleware', function test() {
        describe('location', function test() {
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
                            session: _.clone(req.rendrApp.getSession())
                        };
                        next();
                    };

                    function after(req, res) {
                        response.after = {
                            session: _.clone(req.rendrApp.getSession())
                        };
                        res.json(response);
                    };

                    rendrApp.use(middleware.session());
                    rendrApp.use(middleware.environment());
                    rendrApp.use(middleware.templates());
                    rendrApp.use(before);
                    rendrApp.use(middleware.location());
                    rendrApp.use(after);
                };

                app.configure(expressConfiguration(app));
                server.configure(rendrConfiguration);
                app.use(server);
                request(app)
                    .get('/')
                    .set('host', hosts[0])
                    .set('user-agent', userAgents[0])
                    .end(end);

                function end(err, res) {
                    response = res;
                    done();
                };
            });
            it('should be added to the session', function test(done) {
                var before = response.body.before;
                var after = response.body.after;

                (function existance(before, after) {
                    before.should.not.have.property('location');
                    after.should.have.property('location');
                })(before.session, after.session);

                done();
            });
            it('should be the same for the same host', function test(done) {
                request(app)
                    .get('/')
                    .set('host', hosts[0])
                    .set('user-agent', userAgents[1])
                    .set('cookie', response.get('set-cookie'))
                    .end(end);

                function end(err, response) {
                    var before = response.body.before;
                    var after = response.body.after;

                    (function equality(before, after) {
                        before.should.equal(after);
                    })(JSON.stringify(before.session.location), JSON.stringify(after.session.location));
                    done();
                };
            });
            it('should be different for different hosts', function test(done) {
                request(app)
                    .get('/')
                    .set('host', hosts[1])
                    .set('user-agent', userAgents[0])
                    .set('cookie', response.get('set-cookie'))
                    .end(end);

                function end(err, response) {
                    var before = response.body.before;
                    var after = response.body.after;

                    (function equality(before, after) {
                        before.should.not.equal(after);
                    })(JSON.stringify(before.session.location), JSON.stringify(after.session.location));

                    done();
                };
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
            describe('cities', function test() {
                it('should be added', function test(done) {
                    var before = response.body.before;
                    var after = response.body.after;

                    (function existance(before, after) {
                        before.should.not.have.property('cities');
                        after.should.have.property('cities');
                    })(before.session.location || {}, after.session.location);

                    done();
                });
                it('should be equal to topCities', function test(done) {
                    var before = response.body.before;
                    var after = response.body.after;

                    (function equality(cities, topCities) {
                        cities.should.equal(topCities);
                    })(JSON.stringify(after.session.location.cities), JSON.stringify(after.session.location.topCities));

                    done();
                });
            });
        });
    });
});
