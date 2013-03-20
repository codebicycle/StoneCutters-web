define([
  'underscore',
  'backbone',
  'config/conf'
], function(_, Backbone, Conf){
 	var UserModel = Backbone.Model.extend({
  	initialize: function(options){
  		this.username = options.username;
      this.authToken = options.authToken;
  	},
  	url: function(){
  		return Conf.get('smaug').url + ':' + Conf.get('smaug').port + 
              '/users/'+this.username+"?token="+this.authToken;
  	}
  });
  
  // Return the model for the module
  return UserModel;
});