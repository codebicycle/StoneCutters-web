'use strict';

module.exports = function(worker) {
    var asynquence = require('asynquence');
    var PORT = require('./config').get(['server', 'port'], 8080);
    var logger = require('./logger')('server');

    function onBootstrapError(error) {
        var log = '%j';

        if (error instanceof Error) {
            log = '%s';
            error = error.stack;
        }
        logger.error(log, error);
    }

    function appBootstrap(app) {
        app.listen(PORT, function onServerListening() {
            var log;

            if (worker) {
                log = 'id:%d pid:%d listening on port %d in %s mode';
                logger.log(log, worker.id, process.pid, PORT, app.get('env'));
            }
            else {
                log = 'pid:%d listening on port %d in %s mode';
                logger.log(log, process.pid, PORT, app.get('env'));
            }
        });
    }

    asynquence().or(onBootstrapError)
        .then(require('./appConf'))
        .val(appBootstrap);
};
