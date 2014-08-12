'use strict';

module.exports = function() {
    var config = require('./config');
    var asynquence = require('asynquence');
    var app = asynquence().or(uncaughtError);
    var logger = require('../shared/logger')('server');
    process.env.NODE_ENV = config.get('environment');

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

    if (config.get(['cluster', 'enabled'], false)) {
        app.then(require('./cluster'));
    }

    app.val(require('./bootstrap'));
};

