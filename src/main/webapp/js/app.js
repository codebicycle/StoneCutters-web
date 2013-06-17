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
    Backbone.Model.prototype.Storage = Storage;
    Backbone.Collection.prototype.Storage = Storage;

  //   Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

  //   switch (operator) {
  //       case '==':
  //           return (v1 == v2) ? options.fn(this) : options.inverse(this);
  //           break;
  //       case '===':
  //           return (v1 === v2) ? options.fn(this) : options.inverse(this);
  //           break;
  //       case '<':
  //           return (v1 < v2) ? options.fn(this) : options.inverse(this);
  //           break;
  //       case '<=':
  //           return (v1 <= v2) ? options.fn(this) : options.inverse(this);
  //           break;
  //       case '>':
  //           return (v1 > v2) ? options.fn(this) : options.inverse(this);
  //           break;
  //       case '>=':
  //           return (v1 >= v2) ? options.fn(this) : options.inverse(this);
  //           break;
  //       default:
  //           return options.inverse(this)
  //           break;
  //   }
  //   //return options.inverse(this);
  // });


    Handlebars.registerHelper('getField', function(field) {
      var snip;

      switch(field.type){
        case "radio":{
          snip = '<legend>'+field.label+':</legend>';
          for(i = 0; i < field.values.length; i++){
            snip += '<input id = "radio-'+field.name+i+'"'+ 'type="radio" name="'+field.name+'"value="'+field.values[i].key+'">';
            snip += '<label for="radio-'+field.name+i+'">'+field.values[i].value+'</label>';
          }
        };
        break;

        case "text":{
          snip = '<label for="text-'+field.name+'">'+field.label+'</label>'+'<input type="text" id="text-'+field.name+'" name=' + field.name +'">';
        };
        break;

        case "textarea":{ 
          snip = '<label for="textarea-'+field.name+'">'+field.label+'</label>'+'<textarea id="textarea-'+field.name+'" name=' + field.name +'"></textarea>';
        };
        break;

        case "combobox": {
          snip = '<label for="select-'+field.name+'">'+field.label+'</label>'+
                    '<select id="select-'+field.name+'" name="'+field.name+'">';

          for(i = 0; i < field.values.length; i++){
            snip += '<option name="'+field.name+'" value="'+field.values[i].key+'">'+field.values[i].value+'</option>';
          }

          snip += '</select>';
        };break;
        case "checkbox":
          snip = '<input type="checkbox" id="checkbox-'+field.name+'" name="'+field.name+'">'+
                              '<label for="check-'+field.name +'">'+field.label+'</label>';
        break;
        case "password": snip = '<label for="password-'+field.name+'">'+field.label+'</label>'+'<input type="password" id="password-'+field.name+'" name="'+field.name+'">';
        break;
        case "email": snip = '<label for="email-'+field.name+'">'+field.label+'</label>'+'<input type="email" id="email-'+field.name+'" name="'+field.name+'">';
        break;
        case "url": snip =   '<label for="url-'+field.name+'">'+field.label+'</label>'+'<input type="url" id="url-'+  field.name+'" name="'+field.name+'">';
        break;
        case "range": snip = '<label for="slider-'+field.name+'">'+field.label+'</label>'+
                                '<input type="range" name="'+field.name+'" id="range-'+field.name+
                                '" value="'+field.min+'" min="'+field.min+'" max="'+field.max+'" step="'+field.step+'">';
        break;
        case "image": snip = '<label for="imgs-'+field.name+'">'+field.label+'</label>'+
                            '<input type="file" name="'+field.name+'" id="imgs-'+field.name+'" value="" class="in-'+field.type+'">';
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
