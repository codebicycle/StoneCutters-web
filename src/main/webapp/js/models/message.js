define([
  'underscore',
  'backbone',
  'config/conf'
], function(_, Backbone, Conf){
 	var MessageModel = Backbone.Model.extend({
  	initialize: function(options){
  		this.id = options.id;
  		this.token = options.token;
  	},
  	url: function(){
  		return Conf.get('smaug').url + ':' + Conf.get('smaug').port + 
        '/users/'+this.Storage.get("userObj").userId+'/messages/'+this.id+
        '?token='+this.Storage.get("userObj").authToken;
  	}
  });
  
  // Return the model for the module
  return MessageModel;
});