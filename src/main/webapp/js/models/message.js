define([
  'underscore',
  'backbone',
  'config/conf'
], function(_, Backbone, Conf){
 	var MessageModel = Backbone.Model.extend({
  	initialize: function(options){
      
  	},
    urlRoot: function(){
      return Conf.get('smaug').url + ':' + Conf.get('smaug').port + 
        '/users/'+this.Storage.get("userObj").userId+'/messages';
    }
  });
  
  // Return the model for the module
  return MessageModel;
});