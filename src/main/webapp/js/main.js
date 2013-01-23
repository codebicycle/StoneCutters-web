// Author: Thomas Davis <thomasalwyndavis@gmail.com>
// Filename: main.js

// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
require.config( {
  paths: {
    jquery:     'libs/jquery/jquery-1.8.3-min',
    jqm:        'libs/jqueryMobile/jquery.mobile-1.2.0-min',
    underscore: 'libs/underscore/underscore-min',
    backbone:   'libs/backbone/backbone-min',
    handlebars: 'libs/handlebars/handlebars-1.0.rc.1-min',
    templates:  '../templates',
  },
  
  // Sets the configuration for your third party scripts that are not AMD compatible
  shim: {
    underscore: {
      'exports': '_'
    },
    backbone: {
      'deps': ['underscore' ,'jquery'],
      'exports': 'Backbone'  //attaches "Backbone" to the window object
    },
    handlebars: {
      exports: 'Handlebars'
    }
  } // end Shim Configuration
});

require(['app','jquery'], function(App, $){

  $( document ).on( "mobileinit",
    // Set up the "mobileinit" handler before requiring jQuery Mobile's module
    function() {
      // Prevents all anchor click handling including the addition of active button state and alternate link bluring.
      $.mobile.linkBindingEnabled = false;

      // Disabling this will prevent jQuery Mobile from handling hash changes
      $.mobile.hashListeningEnabled = false;
      $.mobile.ajaxEnabled = false; 
      $.mobile.pushStateEnabled = false; 
      // Remove page from DOM when it’s being replaced 
      $('div[data-role="page"]').live('pagehide', function (event, ui) { 
        $(event.currentTarget).remove(); 
      });
    }
  )
  
  require( [ "jqm" ], function() {
    App.initialize();
  });
});
