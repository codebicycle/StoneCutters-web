'use strict';

var config = require('./config');
var asynquence = require('asynquence');
var app = asynquence().or(uncaughtError);
var logger = require('./logger')('server');

function uncaughtError(error) {
    var log = '%j';

    if (error instanceof Error) {
        log = '%s';
        error = error.stack;
    }
    logger.error(log, error);
}

if (config.get(['newrelic', 'enabled'], false)) {
    require('newrelic');
}

if (config.get(['graphite', 'enabled'], false)) {
    require('./graphite')();
}

if (config.get(['cluster', 'enabled'], false)) {
    app.then(require('./cluster'));
}
app.val(require('./bootstrap'));
