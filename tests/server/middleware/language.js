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
var hosts = ['m.olx.com.ar', 'm.olx.com.br', 'm.olx.in'];
var userAgents = ['UCWEB/8.8 (iPhone; CPU OS_6; en-US)AppleWebKit/534.1 U3/3.0.0 Mobile', 'Mozilla/4.0 (compatible; MSIE 7.0; Windows Phone OS 7.0; Trident/3.1; IEMobile/7.0) Asus;Galaxy6'];
var languageId = 'es-AR';
var Router = require('../../../server/router');

function expressConfiguration(app) {
    return function expressConfiguration() {
        app.use(express.cookieParser());
    };
}

describe('server', function test() {
    describe('middleware', function test() {
        describe('language', function test() {
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

                    rendrApp.use(middleware.session());
                    rendrApp.use(middleware.environment());
                    rendrApp.use(middleware.location());
                    rendrApp.use(before);
                    rendrApp.use(middleware.languages());
                    rendrApp.use(after);
                }

                server.expressApp.configure(expressConfiguration(server.expressApp));
                server.configure(rendrConfiguration);
                request(server.expressApp)
                    .get('/')
                    .set('host', hosts[0])
                    .set('user-agent', userAgents[0])
                    .end(end);

                function end(err, res) {
                    response = res;
                    done();
                }
            });
            describe('languages', function test() {
                it('should be added to the session', function test(done) {
                    var before = response.body.before;

                    after = response.body.after;

                    (function existance(before, after) {
                        before.should.not.have.property('languages');
                        after.should.have.property('languages');
                    })(before.session, after.session);

                    done();
                });
                it('should be the same for the same host', function test(done) {
                    request(server.expressApp)
                        .get('/')
                        .set('host', hosts[0])
                        .set('user-agent', userAgents[1])
                        .set('cookie', response.get('set-cookie'))
                        .end(end);

                    function end(err, response) {
                        var newAfter = response.body.after;

                        (function equality(before, after) {
                            before.should.equal(after);
                        })(JSON.stringify(after.session.languages), JSON.stringify(newAfter.session.languages));
                        done();
                    }
                });
                it('should be different for different hosts', function test(done) {
                    request(server.expressApp)
                        .get('/')
                        .set('host', hosts[2])
                        .set('user-agent', userAgents[0])
                        .set('cookie', response.get('set-cookie'))
                        .end(next);

                        function next(err, response) {
                            request(server.expressApp)
                                .get('/')
                                .set('host', hosts[2])
                                .set('user-agent', userAgents[0])
                                .set('cookie', response.get('set-cookie'))
                                .end(end);

                            function end(err, response) {
                                var newAfter = response.body.after;

                                (function equality(before, after) {
                                    before.should.not.equal(after);
                                })(JSON.stringify(after.session.languages), JSON.stringify(newAfter.session.languages));

                                done();
                            }
                        }
                });
            });
            describe('selectedLanguage', function test() {
                it('should be added to the session', function test(done) {
                    var before = response.body.before;
                    var after = response.body.after;

                    (function existance(before, after) {
                        before.should.not.have.property('selectedLanguage');
                        after.should.have.property('selectedLanguage');
                    })(before.session || {}, after.session);

                    done();
                });
                it('should be equal to req.query.language if present', function test(done) {
                    var before = response.body.before;
                    var after = response.body.after;

                    (function equality(after) {
                        after.should.be.equal(languageId);
                    })(after.session.selectedLanguage);

                    done();
                });
            });
        });
    });
});
