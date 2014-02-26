var path = require('path');
var stylesheetsDir = 'assets/css';
var rendrDir = 'node_modules/rendr';
var rendrHandlebarsDir = 'node_modules/rendr-handlebars';

module.exports = function(grunt) {
  
  require('load-grunt-tasks')(grunt);

  //var config = loadConfig('.grunt/config');

  //config.pkg = grunt.file.readJSON('./package.json');


  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint:{
      all: ['*.js']
    },
    
    // Uglify
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },

    sshconfig: {
      testing: {
        host: "nodebox",
        port: 22,
        username: "root",
        agent: process.env.SSH_AUTH_SOCK,
        privateKey: grunt.file.read(grunt.file.readJSON('conf.json').auth) //"/home/dev/.ssh/id_rsa"
      }
    },
    exec: {
      add_new_line: 'sed -e \'$a\\\' build/build_traceur.js > build/build.js',
      anonymous_functions: '! grep -e "[^:= ][ ]*function()" app/collections/** app/controllers/** app/helpers/** app/models/** app/templates/** app/views/**/** server/**/** app/**',
      delete_compiled_templates: 'rm -rf app/templates/compiledTemplates.js',
      delete_merged_assets: 'rm -rf public/mergedAssets.js'
    },
    sshexec: {
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
    },

    //Traceur i.e. ES6 transpiler
    traceur: {
      options: {
        experimental:true,
        blockBinding:true
      },
      custom: {
        files:{
          'build/mergedAssets.js': ['public/mergedAssets.js']
        } 
      },
    }, 

    //Stylus
    stylus: {
      compile: {
        options: {
          paths: [stylesheetsDir],
          'include css': true
        },
        files: {
          'public/css/html5/styles.css': stylesheetsDir + '/html5/index.styl',
          'public/css/html4/styles.css': stylesheetsDir + '/html4/index.styl',
        }
      }
    },

    //Handlebars
    handlebars: {
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
          var filename = path.basename(filepath);
          // Exclude files that begin with '__' from being sent to the client,
          // i.e. __layout.hbs.
          return filename.slice(0, 2) !== '__';
        }
      }
    },

    // make a zipfile
    compress: {
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
    },

    //Watch
    watch: {
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
        files: [stylesheetsDir + '/**/*.styl', stylesheetsDir + '/**/*.css'],
        tasks: ['stylus'],
        options: {
          interrupt: true
        }
      }
    },

    //Rendr stitch
    rendr_stitch: {
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
            {from: rendrDir + '/client', to: 'rendr/client'},
            {from: rendrDir + '/shared', to: 'rendr/shared'},
            {from: rendrHandlebarsDir, to: 'rendr-handlebars'},
            {from: rendrHandlebarsDir + '/shared', to: 'rendr-handlebars/shared'}
          ]
        },
        files: [{
          dest: 'public/mergedAssets.js',
          src: [
            'app/**/*.js',
            //'build/all.js',
            rendrDir + '/client/**/*.js',
            rendrDir + '/shared/**/*.js',
            rendrHandlebarsDir + '/index.js',
            rendrHandlebarsDir + '/shared/*.js'
          ]
        }]
      }
    },

    //rsync
    rsync: {
    options: {
        args: ["--verbose"],
        exclude: [".git*","*.scss","node_modules"],
        recursive: true
    },
    dist: {
        options: {
            src: "./",
            dest: "./dist"
        }
    },
    stage: {
        options: {
            src: "./dist/",
            dest: "/root/apps/arwen/",
            host: "root@nodebox",
            syncDestIgnoreExcl: true
        }
     },
    prod: {
         options: {
             src: "./dist/",
             dest: "/root/apps/arwen/",
             host: "root@nodebox",
             syncDestIgnoreExcl: true
         }
      }
    },

    //mocha
    //mocha: { 
    //  test: {
    //    src: ['test/**/*.js'],
    //    reporter: 'XUnit',
    //    dest: './test/output/xunit.out',
    //  },
    //},
    //mocha_phantomjs: {
    //  all: ['test/**/*.html'],
    //  reporter: 'XUnit',
    //  dest: './test/output/xunit.out'
    //}

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    }
  });

  //Loading NPM tasks.
  /* Here we should load the NPM task but we are using a grunt task to do this.*/
  /*grunt.loadNpmTasks('grunt task');*/


  //Register the tasks to Grunt.
  grunt.registerTask('runNode', function () {
    grunt.util.spawn({
      cmd: 'node',
      args: ['./node_modules/nodemon/nodemon.js', 'index.js'],
      opts: {
        stdio: 'inherit'
      }
    }, function () {
      grunt.fail.fatal(new Error("nodemon quit"));
    });
  });

  //clean tasks
  grunt.registerTask('clean', ['exec:delete_compiled_templates', 'exec:delete_merged_assets']);

  //Transpiler task
  grunt.registerTask('es6', ['traceur', 'exec:add_new_line']);
  
  //Testing task
  grunt.registerTask('unit-test', ['jshint', 'mochaTest']);

  
  //Search anonymous functions
  grunt.registerTask('anonymous-finder', ['exec:anonymous_functions', 'anonymous-fx']);
  grunt.registerTask('anonymous-fx', 'Search for anonymous functions.', function handler(){
    grunt.task.requires('exec:anonymous_functions');
  });
  
  //Compile tasks (dev-build, dist-build)
  grunt.registerTask('dev-build',  ['handlebars', 'rendr_stitch', 'stylus']);
  grunt.registerTask('dist-build', ['clean','anonymous-finder','handlebars', 'rendr_stitch', 'stylus', 'uglify']);

  //Pipeline tasks
  //Here we compile and deploy the sourcecode.
  grunt.registerTask('pipeline', ['unit-test', 'dist-build', 'rsync:dist', 'rsync:stage', 'sshexec:npm-install', 'sshexec:stop', 'sshexec:start']);

  //Server tasks
  // Run the server and watch for file changes
  grunt.registerTask('server-dev', ['clean','anonymous-finder','runNode', 'dev-build', 'watch']);
  
  // Default task(s).
  //grunt.registerTask('default', ['compile']);
};
