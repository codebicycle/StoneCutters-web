'use strict';

module.exports = function(grunt) {
    return {
      main: {
        options: {
          archive: 'archive.zip'
        },
        files: [
          {src: ['public/*'], dest:  'target/static/'}, // includes files in path
          {src: ['path/**'], dest: 'target/static/'}, // includes files in path and its subdirs
          {expand: true, cwd: 'path/', src: ['**'], dest: 'internal_folder3/'}, // makes all src relative to cwd
          {flatten: true, src: ['path/**'], dest: 'internal_folder4/', filter: 'isFile'} // flattens results to a single level
        ]
      }
    };
};
