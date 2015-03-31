'use strict';

module.exports = function() {
    var os = require('os');
    var config = require('./config');
    var asynquence = require('asynquence');
    var app = asynquence().or(uncaughtError);
    var logger = require('../shared/logger')('server');
    var hostname = require('os').hostname().replace(/^[0-9]+-/, '');

    function uncaughtError(error) {
        var log = '%j';

        if (error instanceof Error) {
            log = '%s';
            error = error.stack;
        }
        logger.error(log, error);
    }

    process.env.NODE_ENV = config.get('environment');

    if (process.env.NODE_ENV === 'production') {
        require('heapdump');
    }

    if (config.get(['newrelic', 'enabled'], false) && (process.env.NODE_ENV !== 'production' || hostname === 'app30-mobile-webapp1')) {
        require('newrelic');
    }

    if (config.get(['memwatch', 'enabled'], false)) {
        require('./modules/memwatch');
    }

    if (config.get(['cluster', 'enabled'], false)) {
        app.then(require('./modules/cluster'));
    }

    if (config.get(['cron', 'enabled'], false)) {
        app.then(require('./crons'));
    }

    app.val(require('./bootstrap'));
};
