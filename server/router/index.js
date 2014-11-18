'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var ViewEngine = require('rendr/server/viewEngine');

var Router = function(server) {

    server.router.getControllerPath = function(controllerName) {
        return this.options.paths.controllerDir + '/' + controllerName;
    };

    server.viewEngine.getViewHtml = function(viewPath, locals, app) {
        var basePath = path.join('app', 'views');
        var BaseView = require('rendr/shared/base/view');
        var name;
        var View;
        var view;

        locals = _.clone(locals);
        locals.app = app;
        name = viewPath.substr(viewPath.indexOf(basePath) + basePath.length + 1);
        View = BaseView.getView(app, name, app.options.entryPath);
        view = new View(locals);
        return view.getHtml();
    };

    server.viewEngine.getBootstrappedData = function(locals, app) {
        return _.extend(this.getCachedData(app), ViewEngine.prototype.getBootstrappedData(locals, app));
    };

    server.viewEngine.getCachedData = function(app) {
        return _.extend(this.getCachedCollections(app));
    };

    server.viewEngine.getCachedCollections = function(app) {
        var cachedData = {};

        Object.keys(_.omit(app.dependencies, 'toJSON')).forEach(function each(name) {
            cachedData[name] = {
                summary: app.fetcher.summarize(app.dependencies[name]),
                data: app.dependencies[name].toJSON()
            };
        });
        return cachedData;
    };

    this.route = function() {
        fs.readdirSync(__dirname).forEach(function(filename) {
            var name = path.basename(filename, '.js');
            if (name === 'index') {
                return;
            }
            require('./' + name)(server.expressApp, server.dataAdapter);
        });
    };

};

module.exports = Router;
