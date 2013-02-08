define([
  'underscore',
  'backbone'
], function(_, Backbone){
  var ConfModel = Backbone.Model.extend({
    defaults: {
      smaug : {
        url : 'http://smaug.herokuapp.com',
        port : '80',
      },
      arwen : {
        url : 'http://arwen.herokuapp.com',
        port : '80',
      }
    }
  });
  
  // Return the model for the module
  return ConfModel;
});