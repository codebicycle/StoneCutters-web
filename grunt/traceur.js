'use strict';

module.exports = function(grunt) {
    return {
      options: {
        experimental:true,
        blockBinding:true
      },
      custom: {
        files:{
          'build/mergedAssets.js': ['public/mergedAssets.js']
        }
      }
    };
};
