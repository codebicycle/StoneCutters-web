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
var localization = require('../../../../server/config').get('localization');
var userAgents = {
    /*'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:27.0) Gecko/20100101 Firefox/27.0': {
        platform: 'desktop'
    },*/
    'UCWEB/8.8 (iPhone; CPU OS_6; en-US)AppleWebKit/534.1 U3/3.0.0 Mobile': {
        platform: 'html5'
    },
    'Mozilla/4.0 (compatible; MSIE 7.0; Windows Phone OS 7.0; Trident/3.1; IEMobile/7.0) Asus;Galaxy6': {
        platform: 'html4'
    },
    'Nokia6100/1.0 (04.01) Profile/MIDP-1.0 Configuration/CLDC-1.0': {
        platform: 'wap'
    }
};

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
        describe('templates', function test() {
            var app;
            var response;

            before(function before(done) {
                (function closure(userAgents) {
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
                        }

                        function after(req, res) {
                            response.after = {
                                session: _.clone(req.rendrApp.getSession())
                            };
                            res.json(response);
                        }

                        rendrApp.use(middleware.session());
                        rendrApp.use(middleware.environment());
                        rendrApp.use(before);
                        rendrApp.use(middleware.templates());
                        rendrApp.use(after);
                    }

                    app.configure(expressConfiguration(app));
                    server.configure(rendrConfiguration);
                    app.use(server);
                    request(app)
                        .get('/')
                        .set('host', 'm.olx.com.ar')
                        .set('user-agent', userAgents[0])
                        .end(end);

                    function end(err, res) {
                        response = res;
                        done();
                    }
                })(Object.keys(userAgents));
            });
            it('should add a platform attribute to the session', function test(done) {
                var before = response.body.before;
                var after = response.body.after;

                (function existance(before, after) {
                    before.should.not.have.property('platform');
                    after.should.have.property('platform');
                })(before.session, after.session);

                done();
            });
            it('should add a template attribute to the session', function test(done) {
                var before = response.body.before;
                var after = response.body.after;

                (function existance(before, after) {
                    before.should.not.have.property('template');
                    after.should.have.property('template');
                })(before.session, after.session);

                done();
            });
            describe('platform', function test() {
                for (var userAgent in userAgents) {
                    closure(userAgent);
                }
                function closure(userAgent) {
                    describe(userAgent, function test() {
                        it('should be "' + userAgents[userAgent].platform + '"', function test(done) {
                            request(app)
                                .get('/')
                                .set('host', 'm.olx.com.ar')
                                .set('user-agent', userAgent)
                                .end(end);

                            function end(err, response) {
                                var before = response.body.before;
                                var after = response.body.after;

                                (function equality(platform) {
                                    platform.should.equal(userAgents[userAgent].platform);
                                })(after.session.platform);

                                done();
                            }
                        });
                    });
                }
            });
            describe('template', function test() {
                for (var userAgent in userAgents) {
                    closure(userAgent);
                }
                function closure(userAgent) {
                    describe(userAgent, function test() {
                        it('should be "default/' + userAgents[userAgent].platform + '" for host m.olx.com', function test(done) {
                            request(app)
                                .get('/')
                                .set('host', 'm.olx.com')
                                .set('user-agent', userAgent)
                                .end(end);

                            function end(err, response) {
                                var before = response.body.before;
                                var after = response.body.after;

                                (function equality(template) {
                                    template.should.equal('default/' + userAgents[userAgent].platform);
                                })(after.session.template);

                                done();
                            }
                        });
                        var locations = localization[userAgents[userAgent].platform];
                        if (locations.length) {
                            locations.forEach(function iteration(location) {
                                it('should be "' + location + '/' + userAgents[userAgent].platform + '" for host ' + location, function test(done) {
                                    request(app)
                                        .get('/')
                                        .set('host', location)
                                        .set('user-agent', userAgent)
                                        .end(end);

                                    function end(err, response) {
                                        var before = response.body.before;
                                        var after = response.body.after;

                                        (function equality(template) {
                                            template.should.equal(location + '/' + userAgents[userAgent].platform);
                                        })(after.session.template);

                                        done();
                                    }
                                });
                            });
                        }
                    });
                }
            });
            describe('directory', function test() {
                for (var userAgent in userAgents) {
                    closure(userAgent);
                }
                function closure(userAgent) {
                    describe(userAgent, function test() {
                        it('should be "default" for host m.olx.com', function test(done) {
                            request(app)
                                .get('/')
                                .set('host', 'm.olx.com')
                                .set('user-agent', userAgent)
                                .end(end);

                            function end(err, response) {
                                var before = response.body.before;
                                var after = response.body.after;

                                (function equality(directory) {
                                    directory.should.equal('default');
                                })(after.session.directory);

                                done();
                            }
                        });
                        var locations = localization[userAgents[userAgent].platform];
                        if (locations.length) {
                            locations.forEach(function iteration(location) {
                                it('should be "' + location + '" for host ' + location, function test(done) {
                                    request(app)
                                        .get('/')
                                        .set('host', location)
                                        .set('user-agent', userAgent)
                                        .end(end);

                                    function end(err, response) {
                                        var before = response.body.before;
                                        var after = response.body.after;

                                        (function equality(directory) {
                                            directory.should.equal(location);
                                        })(after.session.directory);

                                        done();
                                    }
                                });
                            });
                        }
                    });
                }
            });
        });
    });
});