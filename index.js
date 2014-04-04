'use strict';

var CONFIG = require('config');
var asynquence = require('asynquence');
var app = asynquence().or(uncaughtError);

function uncaughtError(error) {
    throw error;
}

if (CONFIG.newrelic.enabled) {
    require('newrelic');
}

if (CONFIG.cluster.enabled) {
    app.then(require('./cluster'));
}
app.val(require('./bootstrap'));
