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

    Handlebars.registerHelper('getField', function(field) {
      var snip;

      switch(field.type){
        case "radio":{
          snip = "";
          if(field.label!= null){
            snip += '<label class="olx-ui-label">' + field.label + '</label>';
          }
          
          for(i = 0; i < field.values.length; i++){
            snip += '<label class="olx-ui-radio">';
            snip += '<input data-role="none" id = "radio-'+field.name+i+'"'+ 'type="radio" name="'+field.name+'"value="'+field.values[i].key+'">';
            snip += '<span>'+field.values[i].value+'</span>';
            snip += '</label>';
          }
          
        };
        break;

        case "text":{
          snip="";
          if(field.label!= null){
            snip += '<label for="text-'+field.name+'" class="olx-ui-label">'+field.label+'</label>';
          }
          snip += '<input type="text" name=' + field.name +'" id="text-'+field.name+'"class="olx-ui-textbox" data-role="none">';
        };
        break;

        case "textarea":{ 
          snip="";
          if(field.label!= null){
            snip += '<label class="olx-ui-label" for="textarea-'+field.name+'">'+field.label+'</label>';
          }
          snip += '<textarea class="olx-ui-textarea" data-role="none" id="textarea-'+field.name+'" name=' + field.name +'"></textarea>';
        };
        break;

        case "combobox": {
          snip = "";
          if(field.label!= null){
            snip += '<label for="select-'+field.name+'">'+field.label+'</label>'
          }
          snip +='<select id="select-'+field.name+'" name="'+field.name+'">';
          for(i = 0; i < field.values.length; i++){
            snip += '<option name="'+field.name+'" value="'+field.values[i].key+'">'+field.values[i].value+'</option>';
          }
          snip += '</select>';
        };break;
        case "checkbox":
          snip = '<label class="olx-ui-checkbox">'
          snip += '<input type="checkbox" id="checkbox-'+field.name+'" name="'+field.name+'">';
          if(field.label!= null){
            snip += '<span>'+field.label+'</span>';
          }
          snip += '</label>';
        break;
        case "password": 
          snip = "";
          if(field.label!= null){
            snip += '<label class="olx-ui-label" for="password-'+field.name+'">'+field.label+'</label>';
          }
          snip += '<input class="olx-ui-textbox" data-role="none" type="password" id="password-'+field.name+'" name="'+field.name+'">';
        break;
        case "email": 
          snip = "";
          if(field.label!= null){
            snip = '<label for="email-'+field.name+'">'+field.label+'</label>';
          }
          snip = '<input type="email" id="email-'+field.name+'" name="'+field.name+'">';
        break;
        case "url": 
          snip = "";
          if(field.label!= null){
            snip +=   '<label class="olx-ui-label" for="url-'+field.name+'">'+field.label+'</label>'
          }
          snip += '<input class="olx-ui-textbox" data-role="none" type="url" id="url-'+  field.name+'" name="'+field.name+'">';
        break;
        case "range": 
          snip = "";
          if(field.label!= null){
            snip += '<label for="slider-'+field.name+'">'+field.label+'</label>';
          }
          snip += '<input type="range" name="'+field.name+'" id="range-'+field.name+
          '" value="'+field.min+'" min="'+field.min+'" max="'+field.max+'" step="'+field.step+'">';
        break;
  
        case "image": 
        snip = "";
        if(field.label!= null){
          snip += '<label class="olx-ui-label" for="imgs-'+field.name+'">'+field.label+'</label>';
        }
        snip += '<input type="file" name="'+field.name+'" id="imgs-'+field.name+'" value="" class="in-'+field.type+'">';
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