'use strict';

var asynquence = require('asynquence');

function uncaughtError(error) {
    throw error;
}

var app = asynquence().or(uncaughtError)
    .then(require('./cluster'))
    .val(require('./bootstrap'));
