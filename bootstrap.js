'use strict';

module.exports = function(worker) {
    var asynquence = require('asynquence');
    var PORT = require('./config').get(['server', 'port'], 8080);
    var debug = require('debug')('arwen');

    function onBootstrapError(error) {
        var log = '%s %j';

        if (error instanceof Error) {
            log = '%s %s';
        }
        debug(log, 'ERROR', error.stack);
    }

    function appBootstrap(app) {
        app.listen(PORT, function onServerListening() {
            var log;

            if (worker) {
                log = 'server %d (pid %d) listening on port %d in %s mode';
                debug(log, worker.id, process.pid, PORT, app.get('env'));
            }
            else {
                log = 'server (pid %d) listening on port %d in %s mode';
                debug(log, process.pid, PORT, app.get('env'));
            }
        });
    }

    asynquence().or(onBootstrapError)
        .then(require('./appConf'))
        .val(appBootstrap);
};
