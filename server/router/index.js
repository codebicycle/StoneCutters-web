'use strict';

var fs = require('fs');
var path = require('path');

var Router = function(server) {

    server.router.getControllerPath = function(controllerName) {
        return this.options.paths.controllerDir + '/' + controllerName;
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
