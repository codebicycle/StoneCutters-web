'use strict';

require('newrelic');

function uncaughtError(error) {
    throw error;
}

var asynquence = require('asynquence');

var app = asynquence().or(uncaughtError);

if (require('config').cluster.enabled) {
    app.then(require('./cluster'));
}
app.val(require('./bootstrap'));
