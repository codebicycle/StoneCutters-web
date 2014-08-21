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
var hosts = ['m.olx.com.ar', 'm.olx.com.br'];
var userAgents = ['UCWEB/8.8 (iPhone; CPU OS_6; en-US)AppleWebKit/534.1 U3/3.0.0 Mobile', 'Mozilla/4.0 (compatible; MSIE 7.0; Windows Phone OS 7.0; Trident/3.1; IEMobile/7.0) Asus;Galaxy6', 'Nokia6100/1.0 (04.01) Profile/MIDP-1.0 Configuration/CLDC-1.0'];
var Router = require('../../../server/router');

function expressConfiguration(app) {
    return function expressConfiguration() {
        app.use(express.cookieParser());
    };
}

describe('server', function test() {
    describe('router', function test() {
        describe('pages', function test() {
            var server;
            var response;

            before(function before(done) {
                server = rendr.createServer({
                    dataAdapter: dataAdapter
                });
                var router = new Router(server);

                function rendrConfiguration(rendrApp) {
                    rendrApp.use(middleware.session());
                    rendrApp.use(middleware.environment());
                    rendrApp.use(middleware.location());
                    rendrApp.use(middleware.languages());
                    rendrApp.use(middleware.templates());
                }

                server.expressApp.configure(expressConfiguration(server.expressApp));
                server.configure(rendrConfiguration);
                router.route();
                request(server.expressApp)
                    .post('/')
                    .set('host', hosts[0])
                    .set('user-agent', userAgents[0])
                    .end(end);

                function end(err, res) {
                    response = res;
                    done();
                }
            });

            describe('health', function test() {
                it('should be a JSON response', function test(done) {
                    request(server.expressApp)
                        .get('/health')
                        .set('host', hosts[0])
                        .set('user-agent', userAgents[0])
                        .set('cookie', response.get('set-cookie'))
                        .end(end);

                    function end(err, res) {
                        (function jsonity(response) {
                            var result = response.should.be.json;
                        })(res);

                        done();
                    }
                });

                it('should be response equal to {online: true, message: "Everything ok!"}', function test(done) {
                    request(server.expressApp)
                        .get('/health')
                        .set('host', hosts[0])
                        .set('user-agent', userAgents[0])
                        .set('cookie', response.get('set-cookie'))
                        .end(end);

                    function end(err, res) {
                        (function equality(response) {
                            response.should.eql({online: true, message: 'Everything ok!'});
                        })(res.body);

                        done();
                    }
                });
            });

            describe('check', function test() {
                it('should have the properties "client" and "server"', function test(done) {
                    request(server.expressApp)
                        .get('/stats/check')
                        .set('host', hosts[0])
                        .set('user-agent', userAgents[0])
                        .set('cookie', response.get('set-cookie'))
                        .end(end);

                    function end(err, res) {
                        (function existance(response) {
                            response.should.have.property('client');
                            response.should.have.property('server');
                        })(res.body);

                        done();
                    }
                });
            });

            describe('stats', function test() {
                it('should have the properties of environment, process, node and memory', function test(done) {
                    request(server.expressApp)
                        .get('/stats')
                        .set('host', hosts[0])
                        .set('user-agent', userAgents[0])
                        .set('cookie', response.get('set-cookie'))
                        .end(end);

                    function end(err, res) {
                        (function existance(response) {
                            response = response.split(' ');
                            response.should.containEql('environment.platform:linux');
                        })(res.text);

                        done();
                    }
                });
            });

            /*describe('force', function test() {
                it('should set the new platform', function test(done) {
                    request(server.expressApp)
                        .get('/force/wap')
                        .set('host', hosts[0])
                        .set('user-agent', userAgents[0])
                        .set('cookie', response.get('set-cookie'))
                        .end(end);

                    function end(err, res) {
                        (function existance(cookies) {
                            cookies[0].should.startWith('platform=wap;');
                        })(res.get('set-cookie'));

                        done();
                    }
                });

                it('should return to the original platform', function test(done) {
                    request(server.expressApp)
                        .get('/force')
                        .set('host', hosts[0])
                        .set('user-agent', userAgents[0])
                        .set('cookie', response.get('set-cookie'))
                        .end(end);

                    function end(err, res) {
                        (function existance(cookies) {
                            cookies[0].should.startWith('platform=;');
                        })(res.get('set-cookie'));

                        done();
                    }
                });
            });*/
        });
    });
});
