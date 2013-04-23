define([
  'underscore',
  'backbone'
], function(_, Backbone){
  var ConfModel = Backbone.Model.extend({
    defaults: {
      smaug : {
        // url : 'http://10.0.5.27',
        // port : '9000',
        // url : 'http://10.0.5.12',
        // port : '9000',
        // url : 'http://smaug.herokuapp.com',
        // port : '80',
        url : 'http://api-v2.olx.com',
        port : '80'
      },
      arwen : {
        url : 'http://arwen.herokuapp.com',
        port : '80',
      }
    }
  });
  
  // Return the model for the module
  return new ConfModel();
});
