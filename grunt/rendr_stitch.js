'use strict';

module.exports = function(grunt) {
    return {
      compile: {
        options: {
          dependencies: [
            'assets/vendor/**/*.js'
          ],
          npmDependencies: {
            underscore: '../rendr/node_modules/underscore/underscore.js',
            backbone: '../rendr/node_modules/backbone/backbone.js',
            handlebars: '../rendr-handlebars/node_modules/handlebars/dist/handlebars.runtime.js',
            async: '../rendr/node_modules/async/lib/async.js'
          },
          aliases: [
            {from: grunt.data.rendrDir + '/client', to: 'rendr/client'},
            {from: grunt.data.rendrDir + '/shared', to: 'rendr/shared'},
            {from: grunt.data.rendrHandlebarsDir, to: 'rendr-handlebars'},
            {from: grunt.data.rendrHandlebarsDir + '/shared', to: 'rendr-handlebars/shared'}
          ]
        },
        files: [{
          dest: 'public/mergedAssets.js',
          src: [
            'app/**/*.js',
            //'build/all.js',
            grunt.data.rendrDir + '/client/**/*.js',
            grunt.data.rendrDir + '/shared/**/*.js',
            grunt.data.rendrHandlebarsDir + '/index.js',
            grunt.data.rendrHandlebarsDir + '/shared/*.js'
          ]
        }]
      }
    };
};
