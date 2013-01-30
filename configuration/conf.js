define([
  'underscore',
  'backbone'
], function(_, Backbone){
  var ConfModel = Backbone.Model.extend({
    defaults: {
      smaug : {
        url : '1.1.1.1',
        port : '8000',
      },
      arwen : {
        url : '1.1.1.2',
        port : '8000',
      }
    }
  });
  
  // Return the model for the module
  return ConfModel;
});