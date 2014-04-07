'use strict';

var config = require('./config');
var asynquence = require('asynquence');
var app = asynquence().or(uncaughtError);
var debug = require('debug')('arwen');


function uncaughtError(error) {
    var log = '%s %j';

    if (error instanceof Error) {
        log = '%s %s';
    }
    debug(log, 'ERROR', error.stack);
}

if (config.get(['newrelic', 'enabled'], false)) {
    require('newrelic');
}

if (config.get(['cluster', 'enabled'], false)) {
    app.then(require('./cluster'));
}
app.val(require('./bootstrap'));
