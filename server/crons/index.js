'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function(done) {
    var crons = {};
    var args = arguments;

    fs.readdir(__dirname, function callback(err, files) {
        if (err) {
            return done.fail(err);
        }
        files.forEach(function(filename) {
            var name = path.basename(filename, '.js');

            if (name === 'index') {
                return;
            }
            crons[name] = require('./' + name);
        });
        done.apply(null, [].slice.call(args, 1).concat([crons]));
    });
};
