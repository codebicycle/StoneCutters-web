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
                callback: function(nodemon) {
                    nodemon.on('log', onLog);
                }
            }
        }
    };
};
