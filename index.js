'use strict';

var config = require('./config');
var asynquence = require('asynquence');
var app = asynquence().or(uncaughtError);
var debug = require('debug')('arwen');
var debugGraphite = require('debug')('arwen:graphite');


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

if (config.get(['graphite', 'enabled'], false)) {
    var graphite = require('graphite');
    var client = graphite.createClient('plaintext://graphite-server:2003/');
    var metrics = {};
    metrics['olx-' + process.env + '.application.arwen.random'] = new Date().getTime();
    client.write(metrics, function(err) {
        if (err) {
            debugGraphite('%s %s', 'ERROR', err);
        }
    });
}

if (config.get(['cluster', 'enabled'], false)) {
    app.then(require('./cluster'));
}
app.val(require('./bootstrap'));
