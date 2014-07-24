'use strict';

module.exports = function(done) {
    var cluster = require('cluster');
    var graphite = require('./graphite')();

    if (cluster.isMaster) {
        var cpuCount = require('os').cpus().length;
        var i;

        for (i = 0; i < cpuCount; i++) {
            cluster.fork({
                GRAPHITE: graphite
            });
        }
        cluster.on('exit', function onClusterExit(worker) {
            console.log('Express server %d exiting', worker.id);
            cluster.fork();
        });
    }
    else {
        done(cluster.worker);
    }
};
