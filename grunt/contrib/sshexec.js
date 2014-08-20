'use strict';

module.exports = function(grunt) {
    return {
      start:{
        command: "cd /root/apps/arwen/ && start arwen",
        options:{
          config: 'testing'
        }
      },
      stop: {
        command: "cd /root/apps/arwen/ && stop arwen",
        options: {
          config: 'testing',
          ignoreErrors: true
        }
      },
      'npm-install':{
        command: "cd /root/apps/arwen/ && npm install --verbose",
        options: {
          config: 'testing',
          ignoreErrors: true
        }
       }
    };
};