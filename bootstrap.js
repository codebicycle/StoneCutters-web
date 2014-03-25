'use strict';

module.exports = function(worker) {
    var asynquence = require('asynquence');
    var PORT = require('config').server.port;

    function onBootstrapError(error) {
        console.log('ARWEN Bootstrap error: ' + error);
    }

    function appBootstrap(app) {
        app.listen(PORT, function onServerListening() {
            var log;

            if (worker) {
                log = 'server %d (pid %d) listening on port %d in %s mode';
                console.log(log, worker.id, process.pid, PORT, app.get('env'));
            }
            else {
                log = 'server (pid %d) listening on port %d in %s mode';
                console.log(log, process.pid, PORT, app.get('env'));
            }
        });
    }

    asynquence().or(onBootstrapError)
        .then(require('./appConf'))
        .val(appBootstrap);
};
