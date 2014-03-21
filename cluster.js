'use strict';

/*
 * This is the implementation of cluster technology for ARWEN.
 */
module.exports = function(done) {
    var cluster = require('cluster');

    if (cluster.isMaster) {
        var cpuCount = require('os').cpus().length;
        var i;

        for (i = 0; i < cpuCount; i++) {
            cluster.fork();
        }
        cluster.on('exit', function onClusterExit(worker) {
            console.log('Express server %d exiting', worker.id);
            //You won't die.
            cluster.fork();
        });
    }
    else {
        done(cluster.worker);
    }
};
