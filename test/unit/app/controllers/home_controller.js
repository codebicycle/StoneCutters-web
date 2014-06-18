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
var Controller = require('../../../../app/controllers/home_controller');
var helpers = require('../../../../app/helpers');

function expressConfiguration(app) {
    return function expressConfiguration() {
        app.use(express.compress());
        app.use(express.cookieParser());
    };
}

describe('app', function test() {
    describe('controllers', function test() {
        describe('home', function test() {
            var app;
            var server;
            var context;
            var response;
            var result;

            describe('index', function test() {
                before(function before(done) {
                    app = express();
                    server = rendr.createServer({
                        dataAdapter: dataAdapter
                    });
                    context = {};

                    function rendrConfiguration(rendrApp) {
                        rendrApp.use(middleware.platform());
                        rendrApp.use(middleware.session());
                        rendrApp.use(middleware.abSelector());
                        rendrApp.use(middleware.environment());
                        rendrApp.use(middleware.location());
                        rendrApp.use(middleware.languages());
                        rendrApp.use(middleware.templates());
                        rendrApp.use(afterMiddleware);
                    }

                    function afterMiddleware(req, res, next) {
                        var params = {};

                        reset(req, res);
                        function callback(err, data) {
                            result.err = err;
                            result.data = data;
                            res.json(result);
                        }
                        Controller.index.call(context, params, callback);
                    }

                    function reset(req, res) {
                        context.app = req.rendrApp;
                        context.currentRoute = {
                            controller: 'home',
                            action: 'index'
                        };
                        context.redirectTo = function(uri, options) {
                            this.redirect = {
                                uri: uri,
                                options: options
                            };
                            res.json(result);
                        };
                        delete context.redirect;
                        result = {
                            err: null,
                            data: {}
                        };
                    }

                    app.configure(expressConfiguration(app));
                    server.configure(rendrConfiguration);
                    app.use(server);
                    require('../../../../server/router')(app, dataAdapter);
                    request(app)
                        .get('/?location=' + utils.locations.in.www)
                        .set('host', utils.getHost('html4', 'in'))
                        .set('user-agent', utils.userAgents.html4)
                        .end(end);

                    function end(err, res) {
                        response = res;
                        done();
                    }
                });
                it('should be added categories to the response', function test(done) {
                    (function existance(response) {
                        response.should.have.property('categories');
                    })(result.data);
                    done();
                });
                it('should be added icons to the response', function test(done) {
                    (function existance(response) {
                        response.should.have.property('icons');
                    })(result.data);
                    done();
                });
                it('should be added analytics URL to the response', function test(done) {
                    (function existance(response) {
                        response.should.have.property('analytics');
                    })(result.data);
                    done();
                });
                it('should be added the correct analytics URL', function test(done) {
                    (function existance(response) {
                        response.should.have.property('id');
                        response.should.have.property('random');
                        response.should.have.property('referer', '-');
                        response.should.have.property('page', 'home/');
                        response.should.have.property('custom');
                        response.custom = JSON.parse(response.custom);
                        response.custom.should.have.property('page_name', 'home_page');
                        response.custom.should.have.property('category', 'home');
                        response.custom.should.not.have.property('subcategory');
                        response.custom.should.have.property('language');
                        response.custom.should.have.property('platform');
                        response.should.have.property('platform', 'html4');
                    })(utils.analyitcsParams(result.data.analytics));
                    done();
                });
                it('should be added seo title to the head object', function test(done) {
                    (function equality(head) {
                        // Necesary for 'use strict'
                        var x;

                        x = head.title.should.be.ok;
                        head.title.should.equal('Home');
                    })(helpers.seo.getHead());
                    done();
                });
                it('should be added seo canonical to the head object', function test(done) {
                    (function equality(head) {
                        // Necesary for 'use strict'
                        var x;

                        x = head.canonical.should.be.ok;
                        head.canonical.should.equal('http://' + utils.locations.in.www);
                    })(helpers.seo.getHead());
                    done();
                });
                it('should be added seo metatags to the head object', function test(done) {
                    (function equality(head) {
                        // Necesary for 'use strict'
                        var x;

                        x = head.metatags.should.be.ok;
                        x = head.metatags.should.be.an.Array;
                        x = head.metatags.should.be.not.empty;
                        head.metatags.should.containEql({
                            name: 'Description',
                            content: 'This is the home page'
                        });
                        head.metatags.should.containEql({
                            name: 'robots',
                            content: 'NOFOLLOW'
                        });
                        head.metatags.should.not.containEql({
                            name: 'cache',
                            content: 'MISS'
                        });
                    })(helpers.seo.getHead());
                    done();
                });
                it('should not redirect', function test(done) {
                    (function existance(response) {
                        response.should.not.have.property('redirect');
                    })(context);
                    done();
                });
            });
        });
    });
});
