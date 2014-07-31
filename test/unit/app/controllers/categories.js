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
var Controller = require('../../../../app/controllers/categories');
var helpers = require('../../../../app/helpers');
var Router = require('../../../../server/router');

function expressConfiguration(app) {
    return function expressConfiguration() {
        app.use(express.compress());
        app.use(express.cookieParser());
    };
}

describe('app', function test() {
    describe('controllers', function test() {
        describe('categories', function test() {
            var url;
            var server;
            var context;
            var category;
            var subcategory;
            var response;
            var result;

            describe('index', function test() {
                before(function before(done) {
                    server = rendr.createServer({
                        dataAdapter: dataAdapter
                    });
                    var router = new Router(server);
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
                        Controller.list.call(context, params, callback);
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

                    server.expressApp.configure(expressConfiguration(server.expressApp));
                    server.configure(rendrConfiguration);
                    router.route();
                    request(server.expressApp)
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
                it('should be added seo title to the head object', function test(done) {
                    (function equality(head) {
                        // Necesary for 'use strict'
                        var x;

                        x = head.title.should.be.ok;
                        head.title.should.equal('Home');
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

            describe('items', function test() {
                before(function before(done) {
                    server = rendr.createServer({
                        dataAdapter: dataAdapter
                    });
                    var router = new Router(server);
                    context = {};

                    function rendrConfiguration(rendrApp) {
                        rendrApp.use(middleware.platform());
                        rendrApp.use(middleware.session());
                        rendrApp.use(middleware.abSelector());
                        rendrApp.use(middleware.environment());
                        rendrApp.use(middleware.location());
                        rendrApp.use(middleware.languages());
                        rendrApp.use(middleware.templates());
                        rendrApp.use(beforeMiddleware);
                        rendrApp.use(afterMiddleware);
                    }

                    function beforeMiddleware(req, res, next) {
                        var categories = req.rendrApp.session.get('categories');
                        var keys = _.keys(categories._byId);

                        category = categories._byId[ _.first(keys) ];
                        subcategory = _.first(category.children);
                        url = helpers.common.slugToUrl(subcategory);
                        next();
                    }

                    function afterMiddleware(req, res, next) {
                        if (req.path === '/') {
                            res.json({
                                success: true
                            });
                            return;
                        }
                        var params = req.path.split(/-cat-|-p-/);
                        var catAndPage = params[1];

                        params = {
                            title: params[0].substr(1),
                            catId: params[1],
                            page: params[2] ? Number(params[2]) : undefined
                        };
                        reset(req, res);
                        function callback(err, data) {
                            result.err = err;
                            result.data = data;
                            res.json(result);
                        }
                        Controller.show.call(context, params, callback);
                    }

                    function reset(req, res) {
                        context.app = req.rendrApp;
                        context.currentRoute = {
                            controller: 'categories',
                            action: 'show'
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

                    server.expressApp.configure(expressConfiguration(server.expressApp));
                    server.configure(rendrConfiguration);
                    router.route();
                    request(server.expressApp)
                        .get('/?location=' + utils.locations.in.www)
                        .set('host', utils.getHost('html4', 'in'))
                        .set('user-agent', utils.userAgents.html4)
                        .end(end);

                    function end(err, res) {
                        response = res;

                        request(server.expressApp)
                            .get('/' + url + '?location=' + utils.locations.in.www)
                            .set('host', utils.getHost('html4', 'in'))
                            .set('user-agent', utils.userAgents.html4)
                            .set('cookie', response.get('set-cookie'))
                            .end(finish);

                        function finish(err, res) {
                            response = res;
                            done();
                        }
                    }
                });
                it('should be added items to the response', function test(done) {
                    (function existance(response) {
                        response.should.have.property('items');
                    })(result.data);
                    done();
                });
                it('should be added category to the response', function test(done) {
                    (function existance(response) {
                        response.should.have.property('category');
                    })(result.data);
                    done();
                });
                it('should be added metadata to the response', function test(done) {
                    (function existance(response) {
                        response.should.have.property('metadata');
                    })(result.data);
                    done();
                });
                it('should be added analytics URL to the response', function test(done) {
                    (function existance(response) {
                        response.should.have.property('analytics');
                    })(result.data);
                    done();
                });
                it('should not redirect', function test(done) {
                    (function existance(response) {
                        response.should.not.have.property('redirect');
                    })(context);
                    done();
                });
                it('should redirect to the correct slug category', function test(done) {
                    request(server.expressApp)
                        .get('/des-cat-' + url.split(/-cat-|-p-/)[1] + '?location=' + utils.locations.in.www)
                        .set('host', utils.getHost('html4', 'in'))
                        .set('user-agent', utils.userAgents.html4)
                        .set('cookie', response.get('set-cookie'))
                        .end(end);

                    function end(err, res) {
                        response = res;

                        (function existance(response) {
                            response.should.have.property('redirect');
                            response.redirect.uri.should.equal('/' + url);
                        })(context);
                        done();
                    }
                });
                it('should redirect to the home ("/")', function test(done) {
                    request(server.expressApp)
                        .get('/' + url.split(/-cat-|-p-/)[0] + '-cat-83168125?location=' + utils.locations.in.www)
                        .set('host', utils.getHost('html4', 'in'))
                        .set('user-agent', utils.userAgents.html4)
                        .set('cookie', response.get('set-cookie'))
                        .end(end);

                    function end(err, res) {
                        response = res;

                        (function existance(response) {
                            response.should.have.property('redirect');
                            response.redirect.uri.should.equal('/');
                        })(context);
                        done();
                    }
                });
            });

            describe('subcategories', function test() {
                before(function before(done) {
                    server = rendr.createServer({
                        dataAdapter: dataAdapter
                    });
                    var router = new Router(server);
                    context = {};

                    function rendrConfiguration(rendrApp) {
                        rendrApp.use(middleware.platform());
                        rendrApp.use(middleware.session());
                        rendrApp.use(middleware.abSelector());
                        rendrApp.use(middleware.environment());
                        rendrApp.use(middleware.location());
                        rendrApp.use(middleware.languages());
                        rendrApp.use(middleware.templates());
                        rendrApp.use(beforeMiddleware);
                        rendrApp.use(afterMiddleware);
                    }

                    function beforeMiddleware(req, res, next) {
                        var categories = req.rendrApp.session.get('categories');
                        var keys = _.keys(categories._byId);

                        category = categories._byId[ _.first(keys) ];
                        url = helpers.common.slugToUrl(category);
                        next();
                    }

                    function afterMiddleware(req, res, next) {
                        if (req.path === '/') {
                            res.json({
                                success: true
                            });
                            return;
                        }
                        var params = req.path.split(/-cat-|-p-/);

                        params = {
                            title: params[0].substr(1),
                            catId: params[1]
                        };
                        reset(req, res);
                        function callback(err, data) {
                            result.err = err;
                            result.data = data;
                            res.json(result);
                        }
                        Controller.show.call(context, params, callback);
                    }

                    function reset(req, res) {
                        context.app = req.rendrApp;
                        context.currentRoute = {
                            controller: 'categories',
                            action: 'show'
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

                    server.expressApp.configure(expressConfiguration(server.expressApp));
                    server.configure(rendrConfiguration);
                    router.route();
                    request(server.expressApp)
                        .get('/?location=' + utils.locations.in.www)
                        .set('host', utils.getHost('html4', 'in'))
                        .set('user-agent', utils.userAgents.html4)
                        .end(end);

                    function end(err, res) {
                        response = res;

                        request(server.expressApp)
                            .get('/' + url + '?location=' + utils.locations.in.www)
                            .set('host', utils.getHost('html4', 'in'))
                            .set('user-agent', utils.userAgents.html4)
                            .set('cookie', response.get('set-cookie'))
                            .end(finish);

                        function finish(err, res) {
                            response = res;
                            done();
                        }
                    }
                });
                it('should be added category to the response', function test(done) {
                    (function existance(response) {
                        response.should.have.property('category');
                    })(result.data);
                    done();
                });
                it('should be added analytics URL to the response', function test(done) {
                    (function existance(response) {
                        response.should.have.property('analytics');
                    })(result.data);
                    done();
                });
                it('should be added seo title to the head object', function test(done) {
                    (function equality(head) {
                        // Necesary for 'use strict'
                        var x;

                        x = head.title.should.be.ok;
                        head.title.should.equal('Listing');
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
                            content: 'This is a listing page'
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
                it('should redirect to the correct slug category', function test(done) {
                    request(server.expressApp)
                        .get('/des-cat-' + url.split(/-cat-|-p-/)[1] + '?location=' + utils.locations.in.www)
                        .set('host', utils.getHost('html4', 'in'))
                        .set('user-agent', utils.userAgents.html4)
                        .set('cookie', response.get('set-cookie'))
                        .end(end);

                    function end(err, res) {
                        response = res;

                        (function existance(response) {
                            response.should.have.property('redirect');
                            response.redirect.uri.should.equal('/' + url);
                        })(context);
                        done();
                    }
                });
                it('should redirect to the home ("/")', function test(done) {
                    request(server.expressApp)
                        .get('/' + url.split(/-cat-|-p-/)[0] + '-cat-1668125?location=' + utils.locations.in.www)
                        .set('host', utils.getHost('html4', 'in'))
                        .set('user-agent', utils.userAgents.html4)
                        .set('cookie', response.get('set-cookie'))
                        .end(end);

                    function end(err, res) {
                        response = res;

                        (function existance(response) {
                            //response.should.have.property('redirect');
                            response.redirect.uri.should.equal('/');
                        })(context);
                        done();
                    }
                });
            });
        });
    });
});
