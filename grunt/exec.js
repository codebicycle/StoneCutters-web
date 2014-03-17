'use strict';

module.exports = function(grunt) {
    return {
      add_new_line: 'sed -e \'$a\\\' build/build_traceur.js > build/build.js',
      anonymous_functions: '! grep -e "[^:= ][ ]*function()" app/collections/** app/controllers/** app/helpers/** app/models/** app/templates/** app/views/**/** server/**/** app/**',
      delete_compiled_templates: 'rm -rf app/templates/compiledTemplates.js',
      delete_merged_assets: 'rm -rf public/mergedAssets.js'
    };
};
