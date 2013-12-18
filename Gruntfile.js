var path = require('path');
var stylesheetsDir = 'assets/stylesheets';
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
        privateKey: grunt.file.read("/home/dev/.ssh/id_rsa")
      }
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

    //Stylus
    stylus: {
      compile: {
        options: {
          paths: [stylesheetsDir],
          'include css': true
        },
        files: {
          'public/styles.css': stylesheetsDir + '/index.styl'
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
     }//,
    // prod: {
    //     options: {
    //         src: "../dist/",
    //         dest: "/var/www/site",
    //         host: "user@live-host",
    //         syncDestIgnoreExcl: true
    //     }
    //   }
    },

    //mocha
    mocha: { 
      test: {
        src: ['test/**/*.html'],
        reporter: 'XUnit',
        dest: './test/output/xunit.out',
      },
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

  // grunt.registerTask('deploy', function () {
  //   grunt.util.spawn({
  //     cmd: 'git push heroku master',
  //     args: [],
  //     opts: {
  //       stdio: 'inherit'
  //     }
  //   }, function () {
  //     grunt.fail.fatal(new Error("git error."));
  //   });
  // });
  
  // grunt.registerTask('uglify', ['uglify']);
  // grunt.registerTask('jshint', ['jshint']);
  
  //Testing task
  grunt.registerTask('unit-test', ['jshint', 'mocha']);
  
  //Compile tasks (dev-build, dist-build)
  grunt.registerTask('dev-build',  ['handlebars', 'rendr_stitch', 'stylus']);
  grunt.registerTask('dist-build', ['handlebars', 'rendr_stitch', 'stylus', 'uglify']);

  //Pipeline tasks
  grunt.registerTask('pipeline', ['unit-test', 'dist-build', 'rsync', 'sshexec:npm-install', 'sshexec:stop', 'sshexec:start']);

  //Server tasks
  // Run the server and watch for file changes
  grunt.registerTask('server-dev', ['runNode', 'dev-build', 'watch']);
  // Run the server with build files
  //grunt.registerTask('server-dist', ['runNode', 'dist-build']);

  // Default task(s).
  //grunt.registerTask('default', ['compile']);
};
