'use strict';

module.exports = function(worker) {
    var asynquence = require('asynquence');

    asynquence().or(onBootstrapError)
        .then(require('./appConf'))
        .val(appBootstrap);

    function onBootstrapError(error) {
        console.log('ARWEN Bootstrap error: ' + error);
    }

    function appBootstrap(app){
        var port = process.env.PORT || 3030;

        app.listen(port, function onServerListening() {
            console.log("server pid %s listening on port %s in %s mode", process.pid, port, app.get('env'));
        });
        exports.app = app;
    }
}









