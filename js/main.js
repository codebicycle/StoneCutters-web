// Author: Thomas Davis <thomasalwyndavis@gmail.com>
// Filename: main.js

// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
require.config( {
  paths: {
    jquery:     'libs/jquery/jquery-1.8.3-min',
    underscore: 'libs/underscore/underscore-min',
    backbone:   'libs/backbone/backbone-min',
    jqm:        'libs/jqueryMobile/jquery.mobile-1.2.0-min',
    templates:  '../templates'
  },
  // Sets the configuration for your third party scripts that are not AMD compatible
  shim: {
    underscore: {
      'exports': '_'
    },
    backbone: {
        'deps': [ 'underscore', 'jquery' ],
        'exports': 'Backbone'  //attaches "Backbone" to the window object
      }
  } // end Shim Configuration
});

require([
  // Load our app module and pass it to our definition function
  'app',
  'jquery',
  'jqm'

], function(App, $){
    $.mobile.ajaxEnabled = false;
    $.mobile.linkBindingEnabled = false;
    $.mobile.hashListeningEnabled = false;
    $.mobile.pushStateEnabled = false;

  // The "app" dependency is passed in as "App"
  // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
  App.initialize();
});
