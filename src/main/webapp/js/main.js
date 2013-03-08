// Filename: main.js

// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
require.config( {
  paths: {
    jquery:     'libs/jquery/jquery-1.8.3-min',
    jqm:        'libs/jqueryMobile/jquery.mobile-1.3.0.min',
    underscore: 'libs/underscore/underscore-min',
    backbone:   'libs/backbone/backbone-min',
    swipe:      'libs/swipe/swipe-items', 
    handlebars: 'libs/handlebars/handlebars-1.0.rc.1-min',
    modernizr:  'libs/modernizr/modernizr.custom',
    templates:  '../templates',
    config:     '../configuration',
    crypto:     'libs/cryptoJS'
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

require(['app','jquery', 'backbone', 'modernizr'], function(App, $, Backbone, modernizr){

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

      //this adds the eventAggregator object to every view. This object is 
      //used for events across views/objects (event aggregator pattern)
      Backbone.View.prototype.eventAggregator = _.extend({}, Backbone.Events);

      //This function is to be overridden by all the subviews that want to 
      //execute some lines of code before the router run the changePage
      Backbone.View.prototype.close = function(){};

      var Storage = null;

      if (Modernizr.localstorage) {
        Storage = {
            set: function(key, value) {
                localStorage[key] = JSON.stringify(value);
            },
            get: function(key) {
                return localStorage[key] ? JSON.parse(localStorage[key]) : null;
            },
            clear: function() {
                localStorage.clear();
            }
        };
      } else{
        window.ls = [];
        //implement a Storage solution independent form localSorage
        Storage = {
            set: function(key, value) {
                window.ls[key] = JSON.stringify(value);
            },
            get: function(key) {
                return window.ls[key] ? JSON.parse(window.ls[key]) : null;
            },
            clear: function() {
                window.ls.length = 0;
            }
        };
      };

      Backbone.View.prototype.Storage = Storage;

    }
  )
  
  require( [ "jqm" ], function() {
    App.initialize();
  });
});
