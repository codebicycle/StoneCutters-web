'use strict';

var fs = require('fs');
var path = require('path');
var crons = {};

fs.readdirSync(__dirname).forEach(function(filename) {
    var name = path.basename(filename, '.js');

    if (name === 'index') {
        return;
    }
    crons[name] = require('./' + name);
});

module.exports = crons;
