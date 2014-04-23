'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function middleware(dataAdapter, excludedUrls) {
    var middlewares = {};

    fs.readdirSync(__dirname).forEach(function(filename) {
        var name = path.basename(filename, '.js');
        if (name === 'index') {
            return;
        }
        middlewares.__defineGetter__(name, function load() {
            return require('./' + name)(dataAdapter, excludedUrls);
        });
    });
    return middlewares;
};
