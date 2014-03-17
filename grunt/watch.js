'use strict';

module.exports = function(grunt) {
    return {
      scripts: {
        files: 'app/**/*.js',
        tasks: ['rendr_stitch'],
        options: {
          interrupt: true
        }
      },
      templates: {
        files: 'app/**/*.hbs',
        tasks: ['handlebars'],
        options: {
          interrupt: true
        }
      },
      stylesheets: {
        files: [grunt.data.stylesheetsDir + '/**/*.styl', grunt.data.stylesheetsDir + '/**/*.css'],
        tasks: ['stylus'],
        options: {
          interrupt: true
        }
      }
    };
};
