'use strict';

module.exports = function() {
    var os = require('os');
    var config = require('./config');
    var asynquence = require('asynquence');
    var app = asynquence().or(uncaughtError);
    var logger = require('../shared/logger')('server');

    function uncaughtError(error) {
        var log = '%j';

        if (error instanceof Error) {
            log = '%s';
            error = error.stack;
        }
        logger.error(log, error);
    }

    process.env.NODE_ENV = config.get('environment');

    if (process.env.NODE_ENV === 'production' && os.hostname() === '578648-app30-mobile-webapp1') {
        require('nodetime').profile({
            accountKey: '466eb88cdca1cd9ef637804794177a8b8adad180',
            appName: 'Mobile-WebApp'
        });
    }

    if (process.env.NODE_ENV === 'production') {
        require('heapdump');
    }

    if (config.get(['newrelic', 'enabled'], false)) {
        require('newrelic');
    }

    if (config.get(['cluster', 'enabled'], false)) {
        app.then(require('./modules/cluster'));
    }

    app.val(require('./bootstrap'));
};
