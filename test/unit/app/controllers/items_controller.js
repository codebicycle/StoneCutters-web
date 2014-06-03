'use strict';

var _ = require('underscore');
var should = require('should');
var request = require('supertest');
var express = require('express');
var rendr = require('rendr');

var utils = require('../../../utils');
var SmaugAdapter = require('../../../../server/adapter/data');
var dataAdapter = new SmaugAdapter({
    userAgent: utils.smaugUserAgent
});
var middleware = require('../../../../server/middleware')(dataAdapter);
var Controller = require('../../../../app/controllers/items_controller');
var helpers = require('../../../../app/helpers');

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
            var app;
            var server;
            var context;
            var category;
            var subcategory;
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
                        rendrApp.use(middleware.categories());
                        rendrApp.use(middleware.languages());
                        rendrApp.use(middleware.templates());
                        rendrApp.use(beforeMiddleware);
                        rendrApp.use(afterMiddleware);
                    }

                    function beforeMiddleware(req, res, next) {
                        var categories = req.rendrApp.getSession('categories');
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
                        var params = req.path.split('-cat-');
                        var catAndPage = params[1];

                        params = {
                            title: params[0].substr(1),
                            catId: catAndPage.replace(/-p-[0-9]+/g, ''),
                            page: Number(catAndPage.replace(/[0-9]+-p-/g, '')) || -1
                        };
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

                        request(app)
                            .get('/' + url + '-p-1?location=' + utils.locations.in.www)
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
                it('should be added the correct analytics URL', function test(done) {
                    (function existance(response) {
                        response.should.have.property('id');
                        response.should.have.property('random');
                        response.should.have.property('referer', '-');
                        response.should.have.property('page', category.name + '/' + subcategory.id + '/listing/');
                        response.should.have.property('custom');
                        response.custom = JSON.parse(response.custom);
                        response.custom.should.have.property('page_name', 'listing_' + category.name);
                        response.custom.should.have.property('category', category.name);
                        response.custom.should.have.property('subcategory', subcategory.name);
                        response.custom.should.have.property('language');
                        response.custom.should.have.property('platform');
                        response.should.have.property('platform', 'html4');
                    })(utils.deparams(result.data.analytics.replace('/pageview.gif?', '')));
                    done();
                });
                it('should be added seo canonical to the head object', function test(done) {
                    (function equality(head) {
                        // Necesary for 'use strict'
                        var x;

                        x = head.canonical.should.be.ok;
                        head.canonical.should.equal('http://' + utils.locations.in.www + '/' + url + '-p-1');
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
                    request(app)
                        .get('/des-cat-' + url.split('-cat-')[1] + '-p-1?location=' + utils.locations.in.www)
                        .set('host', utils.getHost('html4', 'in'))
                        .set('user-agent', utils.userAgents.html4)
                        .set('cookie', response.get('set-cookie'))
                        .end(end);

                    function end(err, res) {
                        response = res;

                        (function existance(response) {
                            response.should.have.property('redirect');
                            response.redirect.uri.should.equal('/' + url + '-p-1');
                        })(context);
                        done();
                    }
                });
                it('should redirect to the home ("/")', function test(done) {
                    request(app)
                        .get('/' + url.split('-cat-')[0] + '-cat-83168125-p-1?location=' + utils.locations.in.www)
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

            describe('search', function test() {
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
                        rendrApp.use(middleware.categories());
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
                        var page = (params.length === 5 ? Number(params[4].replace('-p-', '')) : 1);

                        params = {
                            search: params[3],
                            page: page
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
                        .get('/nf/search/a?location=' + utils.locations.in.www)
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
                        response.should.have.property('page', 'nocat/search/');
                        response.should.have.property('custom');
                        response.custom = JSON.parse(response.custom);
                        response.custom.should.have.property('page_name', 'listing_all');
                        response.custom.should.have.property('category', 'listing');
                        response.custom.should.have.property('keyword', 'a');
                        response.custom.should.have.property('page_nb');
                        response.custom.should.have.property('language');
                        response.custom.should.have.property('platform');
                        response.should.have.property('platform', 'html4');
                    })(utils.deparams(result.data.analytics.replace('/pageview.gif?', '')));
                    done();
                });
                it('should be added seo canonical to the head object', function test(done) {
                    (function equality(head) {
                        // Necesary for 'use strict'
                        var x;

                        x = head.canonical.should.be.ok;
                        head.canonical.should.equal('http://' + utils.locations.in.www + '/nf/search/a/-p-1');
                    })(helpers.seo.getHead());
                    done();
                });
                it('should have others items when change page 1 to 2', function test(done) {
                    var beforeResult = _.clone(result);
                    request(app)
                        .get('/nf/search/a/-p-2?location=' + utils.locations.in.www)
                        .set('host', utils.getHost('html4', 'in'))
                        .set('user-agent', utils.userAgents.html4)
                        .set('cookie', response.get('set-cookie'))
                        .end(end);

                    function end(err, res) {
                        response = res;
                        (function equality(before, after) {
                            // Necesary for 'use strict'
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
                it('should redirect to the home ("/")', function test(done) {
                    request(app)
                        .get('/nf/redirect/?location=' + utils.locations.in.www)
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

            describe('show', function test() {
                var items;
                var item;

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
                        rendrApp.use(middleware.categories());
                        rendrApp.use(middleware.languages());
                        rendrApp.use(middleware.templates());
                        rendrApp.use(beforeMiddleware);
                        rendrApp.use(afterMiddleware);
                    }

                    function beforeMiddleware(req, res, next) {
                        var params = {
                            search: 'a',
                            page: 1
                        };
                        
                        reset(req, res, next);
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
                        var params = req.path.split('-iid-');

                        params = {
                            title: params[0].substr(1),
                            itemId: params[1]
                        };
                        reset(req, res);
                        function callback(err, data) {
                            result.err = err;
                            result.data = data;
                            res.json(result);
                        }
                        Controller.show.call(context, params, callback);
                    }

                    function reset(req, res, next) {
                        context.app = req.rendrApp;
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

                        request(app)
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
                    })(utils.deparams(result.data.analytics.replace('/pageview.gif?', '')));
                    done();
                });
                it('should be added seo canonical to the head object', function test(done) {
                    (function equality(head) {
                        // Necesary for 'use strict'
                        var x;

                        x = head.canonical.should.be.ok;
                        head.canonical.should.equal('http://' + utils.locations.in.www + '/' + url);
                    })(helpers.seo.getHead());
                    done();
                });
                it('should have others item when change itemId', function test(done) {
                    var beforeResult = _.clone(result);
                    request(app)
                        .get('/' + helpers.common.slugToUrl(items[1]) + '?location=' + utils.locations.in.www)
                        .set('host', utils.getHost('html4', 'in'))
                        .set('user-agent', utils.userAgents.html4)
                        .set('cookie', response.get('set-cookie'))
                        .end(end);

                    function end(err, res) {
                        response = res;
                        (function equality(before, after) {
                            // Necesary for 'use strict'
                            var x;

                            x = before.should.be.not.empty;
                            x = after.should.be.not.empty;
                            before.should.not.equal(after);
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
                    request(app)
                        .get('/des-iid-' + url.split('-iid-')[1] + '?location=' + utils.locations.in.www)
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
                it('should redirect to the 404', function test(done) {
                    request(app)
                        .get('/des-iid-1234567890?location=' + utils.locations.in.www)
                        .set('host', utils.getHost('html4', 'in'))
                        .set('user-agent', utils.userAgents.html4)
                        .set('cookie', response.get('set-cookie'))
                        .end(end);

                    function end(err, res) {
                        response = res;

                        (function existance(response) {
                            response.should.have.property('redirect');
                            response.redirect.uri.should.equal('/404');
                        })(context);
                        done();
                    }
                });
            });
        });
    });
});