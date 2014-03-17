'use strict';

module.exports = function(grunt) {
    return {
      compile: {
        options: {
          paths: [grunt.data.stylesheetsDir],
          'include css': true
        },
        files: {
          'public/css/html5/styles.css': grunt.data.stylesheetsDir + '/html5/index.styl',
          'public/css/html4/styles.css': grunt.data.stylesheetsDir + '/html4/index.styl',
        }
      }
    };
};
