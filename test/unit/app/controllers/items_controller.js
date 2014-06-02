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
        app.use(express.cookieParser());
    };
}

function rendrConfiguration(rendrApp) {
    rendrApp.use(middleware.platform());
    rendrApp.use(middleware.session());
    rendrApp.use(middleware.abSelector());
    rendrApp.use(middleware.environment());
    rendrApp.use(middleware.location());
    rendrApp.use(middleware.categories());
    rendrApp.use(middleware.languages());
    rendrApp.use(middleware.templates());
}

describe('app', function test() {
    describe('controllers', function test() {
        describe('items', function test() {
            var url;
            var app;
            var server;
            var context;
            var category;
            var response;
            var result;

            describe('index', function testIndex() {
                before(function beforeIndex(done) {
                    app = express();
                    server = rendr.createServer({
                        dataAdapter: dataAdapter
                    });
                    context = {
                        redirectTo: function(uri, options) {
                            this.redirect = {
                                uri: uri,
                                options: options
                            };
                        }
                    };
                    result = {
                        err: null,
                        data: {}
                    };

                    function rendrConfig(rendrApp) {
                        rendrConfiguration(rendrApp);
                        rendrApp.use(categoryMiddleware);
                        rendrApp.use(afterMiddlewares);
                    }

                    function categoryMiddleware(req, res, next) {
                        var categories = req.rendrApp.getSession('categories');
                        var keys = _.keys(categories._byId);
                        var parentCategory = categories._byId[ _.first(keys) ];
                        
                        category = _.first(parentCategory.children);
                        category.parent = parentCategory;
                        url = helpers.common.slugToUrl(category);
                        next();
                    }

                    function afterMiddlewares(req, res, next) {
                        var params = req.path.split('-cat-');
                        var catAndPage = params[1];

                        params = {
                            title: params[0].substr(1),
                            catId: catAndPage.replace(/-p-[0-9]+/g, ''),
                            page: Number(catAndPage.replace(/[0-9]+-p-/g, '')) || -1
                        };
                        context.app = req.rendrApp;
                        delete context.redirec;
                        result = {
                            err: null,
                            data: {}
                        };

                        function callback(err, data) {
                            result.err = err;
                            result.data = data;
                            res.json(result);
                        }
                        Controller.index.call(context, params, callback);
                        if (context.redirect) {
                            res.json(result);
                        }
                    }

                    app.configure(expressConfiguration(app));
                    server.configure(rendrConfig);
                    app.use(server);
                    require('../../../../server/router')(app, dataAdapter);
                    request(app)
                        .get('/algo-cat-123456789-p-1?location=' + utils.locations.in.www)
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
console.log(_.isEmpty(result.data));
console.log(_.isEmpty(result.err));
console.log(context.redirect);
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
                        response.should.have.property('referer', '/');
                        response.should.have.property('page', category.parent.name + '/' + category.id + '/listing/');
                        response.should.have.property('custom');
                        response.custom = JSON.parse(response.custom);
                        response.custom.should.have.property('page_name', 'listing_' + category.parent.name);
                        response.custom.should.have.property('category', category.parent.name);
                        response.custom.should.have.property('subcategory', category.name);
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
                });/*
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
                });*/
            });
/*
            describe('search', function testSearch() {
                before(function beforeSearch(done) {
                    app = express();
                    server = rendr.createServer({
                        dataAdapter: dataAdapter
                    });
                    context = {
                        redirectTo: function(uri, options) {
                            this.redirect = {
                                uri: uri,
                                options: options
                            };
                        }
                    };
                    result = {
                        err: null,
                        data: {}
                    };

                    function rendrConfig(rendrApp) {
                        rendrConfiguration(rendrApp);
                        rendrApp.use(afterMiddlewares);
                    }

                    function afterMiddlewares(req, res, next) {
                        var params = req.path.split('/');
                        var page = (params.length === 5 ? Number(params[4].replace('-p-', '')) : 1);

                        params = {
                            search: params[3],
                            page: page
                        };
                        context.app = req.rendrApp;
                        delete context.redirec;
                        result = {
                            err: null,
                            data: {}
                        };

                        function callback(err, data) {
                            result.err = err;
                            result.data = data;
                            res.json(result);
                        }
                        Controller.search.call(context, params, callback);
                        if (context.redirect) {
                            res.json(result);
                        }
                    }

                    app.configure(expressConfiguration(app));
                    server.configure(rendrConfig);
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
                        response.should.have.property('referer', '/');
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
                it('should have items the property slug', function test(done) {
                    (function equality(items) {
                        // Necesary for 'use strict'
                        var x;

                        x = items.should.be.not.empty;
                        _.first(items).should.have.property('slug');
                    })(result.data.items);
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
                });/*
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
*/
        });
    });
});