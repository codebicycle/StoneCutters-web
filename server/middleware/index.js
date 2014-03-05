'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function middleware(dataAdapter) {
    var middleware = {};

    fs.readdirSync(__dirname).forEach(function(filename) {
        var name = path.basename(filename, '.js');
        if (name === 'index') {
            return;
        }
        middleware.__defineGetter__(name, function load() {
            return require('./' + name)(dataAdapter);
        });
    });
    return middleware;
}
