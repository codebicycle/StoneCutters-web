// Filename: app.js
define([
  'jquery', 
  'underscore', 
  'backbone',
  'router', // Request router.js
  'views/base/BaseView',
], function($, _, Backbone, Router, BaseView){
  var initialize = function(){
    // Pass in our Router module and call it's initialize function
    Router.initialize();

    //initialize the base view to be able to access sub pages (ie items)
    //directly from their static URL
    new BaseView({});
  };

  return { 
    initialize: initialize
  };
});
