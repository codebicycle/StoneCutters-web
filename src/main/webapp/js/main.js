// Filename: main.js

// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
require.config( {
  paths: {
    jquery:     'libs/jquery/jquery-1.9.1.min',
    jqm:        'libs/jqueryMobile/jquery.mobile-1.3.0.min',
    underscore: 'libs/underscore/underscore-min',
    backbone:   'libs/backbone/backbone-min',
    swipe:      'libs/swipe/swipe-items', 
    handlebars: 'libs/handlebars/handlebars-1.0.rc.1-min',
    modernizr:  'libs/modernizr/modernizr.custom',
    templates:  '../templates',
    config:     '../configuration',
    crypto:     'libs/cryptoJS',
    constants:     '../constants',
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

require(['app','jquery', 'backbone'], function(App, $, Backbone){

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
      $('body').on('pagehide', 'div[data-role="page"]', function (event, ui) { 
        $(event.currentTarget).remove(); 
      });
    }
  )
  
  require( [ "jqm" ], function() {
    App.initialize();
  });
});
