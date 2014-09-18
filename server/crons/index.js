'use strict';

var fs = require('fs');
var path = require('path');
var excluded = require('../config').get(['middleware', 'exclude'], []);

module.exports = function middleware(dataAdapter) {
    var middlewares = {};

    fs.readdirSync(__dirname).forEach(function(filename) {
        var name = path.basename(filename, '.js');
        if (name === 'index') {
            return;
        }
        middlewares.__defineGetter__(name, function load() {
            return require('./' + name)(dataAdapter, excluded);
        });
    });
    return middlewares;
};
