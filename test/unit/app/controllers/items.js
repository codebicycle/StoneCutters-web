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
var Controller = require('../../../../app/controllers/items');
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
        describe('items', function test() {
            var url;
            var server;
            var context;
            var category;
            var subcategory;
            var response;
            var result;

            describe('search', function test() {
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
                        if (req.path === '/') {
                            res.json({
                                success: true
                            });
                            return;
                        }
                        var params = req.path.split('/');

                        params = {
                            search: params[3],
                            page: (params.length === 5 ? Number(params[4].replace('-p-', '')) : undefined)
                        };
                        reset(req, res);
                        function callback(err, data) {
                            result.err = err;
                            result.data = data;
                            res.json(result);
                        }
                        Controller.search.call(context, params, callback);
                    }

                    function reset(req, res) {
                        context.app = req.rendrApp;
                        context.currentRoute = {
                            controller: 'items',
                            action: 'search'
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
                        .get('/nf/search/i')
                        .set('host', utils.getHost('html4', 'in'))
                        .set('user-agent', utils.userAgents.html4)
                        .end(end);

                    function end(err, res) {
                        response = res;
                        done();
                    }
                });
                it('should be added items to the response', function test(done) {
                    (function existance(response) {
                        response.should.have.property('items');
                    })(result.data);
                    done();
                });
                it('should be added search keyword to the response', function test(done) {
                    (function existance(response) {
                        response.should.have.property('search');
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
                it('should be added the correct analytics URL', function test(done) {
                    (function existance(response) {
                        response.should.have.property('id');
                        response.should.have.property('random');
                        response.should.have.property('referer', '-');
                        response.should.have.property('page', '/nocat/search/');
                        response.should.have.property('custom');
                        response.custom = JSON.parse(response.custom);
                        response.custom.should.have.property('page_name', 'listing_all');
                        response.custom.should.have.property('category', 'listing');
                        response.custom.should.have.property('keyword', 'i');
                        response.custom.should.have.property('page_nb');
                        response.custom.should.have.property('language');
                        response.custom.should.have.property('platform');
                        response.should.have.property('platform', 'html4');
                    })(utils.analyitcsParams(result.data.analytics));
                    done();
                });
                it('should have others items when change page 1 to 2', function test(done) {
                    var beforeResult = _.clone(result);
                    request(server.expressApp)
                        .get('/nf/search/a/-p-2')
                        .set('host', utils.getHost('html4', 'in'))
                        .set('user-agent', utils.userAgents.html4)
                        .set('cookie', response.get('set-cookie'))
                        .end(end);

                    function end(err, res) {
                        response = res;
                        (function equality(before, after) {
                            var x;

                            x = before.should.be.not.empty;
                            x = after.should.be.not.empty;
                            _.first(before).should.not.equal(_.first(after));
                        })(beforeResult.data.items, result.data.items);
                        done();
                    }
                });
                it('should not redirect', function test(done) {
                    (function existance(response) {
                        response.should.not.have.property('redirect');
                    })(context);
                    done();
                });
                it('should not redirect on empty search', function test(done) {
                    request(server.expressApp)
                        .get('/nf/search')
                        .set('host', utils.getHost('html4', 'in'))
                        .set('user-agent', utils.userAgents.html4)
                        .set('cookie', response.get('set-cookie'))
                        .end(end);

                    function end(err, res) {
                        response = res;

                        (function existance(response) {
                            response.should.not.have.property('redirect');
                        })(context);
                        done();
                    }
                });
            });

            describe('show', function test() {
                var items;
                var item;

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
                        var params = {
                            search: 'a'
                        };

                        reset(req, res, 'search', next);
                        function callback(err, data) {
                            items = data.items;
                            item = _.first(items);
                            url = helpers.common.slugToUrl(item);
                            next();
                        }
                        Controller.search.call(context, params, callback);
                    }

                    function afterMiddleware(req, res, next) {
                        if (req.path === '/') {
                            res.json({
                                success: true
                            });
                            return;
                        }
                        var params = req.path.split((~req.path.indexOf('-iid-') ? '-' : '') + 'iid-');

                        params = {
                            title: params[0].substr(1),
                            itemId: params[1]
                        };
                        reset(req, res, 'show');
                        function callback(err, data) {
                            result.err = err;
                            result.data = data;
                            res.json(result);
                        }
                        Controller.show.call(context, params, callback);
                    }

                    function reset(req, res, action, next) {
                        context.app = req.rendrApp;
                        context.currentRoute = {
                            controller: 'items',
                            action: action
                        };
                        context.redirectTo = function(uri, options) {
                            this.redirect = {
                                uri: uri,
                                options: options
                            };
                            if (next) {
                                next();
                                return;
                            }
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
                        .get('/')
                        .set('host', utils.getHost('html4', 'in'))
                        .set('user-agent', utils.userAgents.html4)
                        .end(end);

                    function end(err, res) {
                        response = res;

                        request(server.expressApp)
                            .get('/' + url)
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
                it('should be added item to the response', function test(done) {
                    (function existance(response) {
                        response.should.have.property('item');
                    })(result.data);
                    done();
                });
                it('should be added position image galery to the response', function test(done) {
                    (function existance(response) {
                        response.should.have.property('pos');
                    })(result.data);
                    done();
                });
                it('should be added relatedAdsLink to the response', function test(done) {
                    (function existance(response) {
                        response.should.have.property('relatedAdsLink');
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
                        response.should.have.property('page');
                        response.should.have.property('custom');
                        response.custom = JSON.parse(response.custom);
                        response.custom.should.have.property('page_name', 'detail_page');
                        response.custom.should.have.property('category');
                        response.custom.should.have.property('ad_category');
                        response.custom.should.have.property('ad_subcategory');
                        response.custom.should.have.property('ad_id');
                        response.custom.should.have.property('ad_photo');
                        response.custom.should.have.property('poster_id');
                        response.custom.should.have.property('poster_type');
                        response.custom.should.have.property('action_type', 'loaded');
                        response.custom.should.have.property('posting_to_action');
                        response.custom.should.have.property('geo1');
                        response.custom.should.have.property('geo2');
                        response.custom.should.have.property('language');
                        response.custom.should.have.property('platform');
                        response.should.have.property('platform', 'html4');
                    })(utils.analyitcsParams(result.data.analytics));
                    done();
                });
                it('should have other item when change itemId', function test(done) {
                    var beforeResult = _.clone(result);
                    request(server.expressApp)
                        .get('/' + helpers.common.slugToUrl(items[1]))
                        .set('host', utils.getHost('html4', 'in'))
                        .set('user-agent', utils.userAgents.html4)
                        .set('cookie', response.get('set-cookie'))
                        .end(end);

                    function end(err, res) {
                        response = res;
                        (function equality(before, after) {
                            var x;

                            x = before.should.be.not.empty;
                            x = after.should.be.not.empty;
                            before.id.should.not.equal(after.id);
                        })(beforeResult.data.item, result.data.item);
                        done();
                    }
                });
                it('should not redirect', function test(done) {
                    (function existance(response) {
                        response.should.not.have.property('redirect');
                    })(context);
                    done();
                });
                it('should redirect to the correct slug item', function test(done) {
                    request(server.expressApp)
                        .get('/des-iid-' + url.split('-iid-')[1])
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
            });
        });
    });
});
