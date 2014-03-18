'use strict';

/*
 * This is the implementation of cluster technology for ARWEN.
 */
 module.exports = function(done, store) {
    var cluster = require('cluster');

    if (cluster.isMaster) {
        var cpuCount = require('os').cpus().length;
        var i;

        for (i = 0; i < cpuCount; i++) {
            console.log("I am forking a new process");
            cluster.fork();
        }
        cluster.on('exit', function onClusterExit(worker) {
            console.log('Express server %d exiting', worker.id);
            //You won't die.
            cluster.fork();
        });
    }
    else {
        done(store, cluster.worker);
    }
}
