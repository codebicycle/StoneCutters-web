'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('underscore');

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

    this.route = function() {
        fs.readdirSync(__dirname).forEach(function(filename) {
            var name = path.basename(filename, '.js');
            if (name === 'index' || name === 'pages') {
                return;
            }
            require('./' + name)(server.expressApp, server.dataAdapter);
        });
        require('./pages')(server.expressApp, server.dataAdapter);
    };

};

module.exports = Router;
