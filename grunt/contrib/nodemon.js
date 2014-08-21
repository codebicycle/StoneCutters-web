'use strict';

module.exports = function(grunt) {
    function onLog(event) {
        console.log(event.colour);
    }

    return {
        start: {
            script: 'index.js',
            options: {
                env: {
                    DEBUG: 'arwen:server*,arwen:*:error'
                },
                ext: 'js,html',
                delay: 2000,
                callback: function(nodemon) {
                    nodemon.on('log', onLog);
                }
            }
        },
        debug: {
            script: 'index.js',
            options: {
                env: {
                    DEBUG: 'arwen:*'
                },
                ext: 'js,html',
                delay: 2000,
                callback: function(nodemon) {
                    nodemon.on('log', onLog);
                }
            }
        }
    };
};
