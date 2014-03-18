'use strict';

console.log("<DEBUG CONSOLE LOG>Starting index.js");

var asynquence = require('asynquence');

function uncaughtError(error) {
    throw error;
};

var app = asynquence().or(uncaughtError)
    .then(require('./cluster'))
    .val(require('./bootstrap'));
