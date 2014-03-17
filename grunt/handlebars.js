'use strict';

module.exports = function(grunt) {
    return {
      compile: {
        options: {
          namespace: false,
          commonjs: true,
          processName: function(filename) {
            return filename.replace('app/templates/', '').replace('.hbs', '');
          }
        },
        src: "app/templates/**/*.hbs",
        dest: "app/templates/compiledTemplates.js",
        filter: function(filepath) {
          var filename = require('path').basename(filepath);

          /** Exclude files that begin with '__' from being sent to the client,
           i.e. __layout.hbs. **/
          return filename.slice(0, 2) !== '__';
        }
      }
    };
};
