'use strict';

var _ = require('underscore');
var should = require('should');
var request = require('supertest');
var express = require('express');
var rendr = require('rendr');

var utils = require('../../utils');
var SmaugAdapter = require('../../../shared/adapters/data');
var dataAdapter = new SmaugAdapter({
    userAgent: utils.smaugUserAgent
});
var middleware = require('../../../server/middleware')(dataAdapter);
var Controller = require('../../../app/controllers/redirections');
var helpers = require('../../../app/helpers');
var Router = require('../../../server/router');

function expressConfiguration(app) {
    return function expressConfiguration() {
        app.use(express.compress());
        app.use(express.cookieParser());
    };
}

describe('app', function test() {
    describe('controllers', function test() {
        describe('redirections', function test() {
            var url;
            var server;
            var context;
            var category;
            var subcategory;
            var response;
            var result;

            function handlerBeforeRedirections(done, action, url, _params) {
                server = rendr.createServer({
                    dataAdapter: dataAdapter
                });
                var router = new Router(server);
                context = {};

                function rendrConfiguration(rendrApp) {
                    rendrApp.use(middleware.platform());
                    rendrApp.use(middleware.session());
                    rendrApp.use(middleware.environment());
                    rendrApp.use(middleware.location());
                    rendrApp.use(middleware.templates());
                    rendrApp.use(middleware.device());
                    rendrApp.use(afterMiddleware);
                }

                function afterMiddleware(req, res, next) {
                    var params = _params;

                    reset(req, res);
                    function callback(err, data) {
                        result.err = err;
                        result.data = data;
                        res.json(result);
                    }
                    Controller[action].call(context, params, callback);
                }

                function reset(req, res) {
                    context.app = req.rendrApp;
                    context.currentRoute = {
                        controller: 'redirections',
                        action: action
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
                    .get(url)
                    .set('host', utils.getHost('html4', 'in'))
                    .set('user-agent', utils.userAgents.html4)
                    .end(end);

                function end(err, res) {
                    response = res;
                    done();
                }
            }

            describe('category', function test() {
                before(function before(done) {
                    handlerBeforeRedirections(done, 'category', '/category/16/Real%20State', {
                        categoryId: 16
                    });
                });
                it('should redirect to the correct url', function test(done) {
                    (function existance(response) {
                        response.should.have.property('redirect');
                        response.redirect.uri.should.equal('/des-cat-16');
                    })(context);
                    done();
                });
            });
        });
    });
});
