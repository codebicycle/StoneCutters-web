// Filename: app.js
define([
  'jquery', 
  'underscore', 
  'backbone',
  'router',
  'modernizr',
  'views/base/BaseView',
], function($, _, Backbone, Router, modernizr, BaseView){
  var initialize = function(){
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

    Handlebars.registerHelper('getField', function(field) {
      var snip;

      switch(field.type){
        case "text-1": snip = field.title+'<input type="text" name='+field.name+' class="in-'+field.type+'">';
        break;
        case "text-2": snip = field.title+'<textarea name='+field.name+' class="in-'+field.type+'"></textarea>';
        break;
        case "radio":{
          snip = '<fieldset data-role="controlgroup"><legend>'+field.title+':</legend>';

          for(i = 0; i < field.opts.length; i++){
            snip += '<input type="radio" class="in-'+field.type+'" name="'+field.name+'" id="radio-'+field.title+i+'" value="'+field.opts[i]+'">';
            snip += '<label for="radio-'+field.title+i+'">'+field.opts[i]+'</label>';
          }

          snip += '</fieldset>';
        };break;
        case "combo": {
          snip = '<label for="select-'+field.title+'" class="select">'+field.title+'</label>'+
                    '<select id="select-'+field.title+'" class="in-'+field.type+'" name="'+field.name+'">';

          for(i = 0; i < field.opts.length; i++){
            snip += '<option value="'+field.opts[i]+'">'+field.opts[i]+'</option>';
          }

          snip += '</select>';
        };break;
        case "imgs": snip = '<label for="imgs">'+field.title+'</label>'+
                            '<input type="file" name="'+field.name+'" id="imgs" value="" class="in-'+field.type+'">';
        break;
        case "check": snip = '<input type="checkbox" id="check-'+field.title+'" class="in-'+field.type+'" name="'+field.name+'">'+
                              '<label for="check-'+field.title+'">'+field.title+'</label>';
        break;
        case "slider": snip = '<label for="slider-'+field.title+'">'+field.title+'</label>'+
                                '<input type="range" name="'+field.name+'" class="in-'+field.type+'" id="slider-'+field.title+
                                '" value="'+field.min+'" min="'+field.min+'" max="'+field.max+'" step="'+field.step+'">';
        break;
      }

      return new Handlebars.SafeString(snip);
    });
    // Pass in our Router module and call it's initialize function
    Router.initialize();

    //initialize the base view to be able to access sub pages (ie items)
    //directly from their static URL
    var dfd = $.Deferred().done(_.bind(function(page){
          page.render();
        }, this));

    new BaseView({'deferred': dfd});
  };

  return { 
    initialize: initialize
  };
});