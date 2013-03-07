define([
  'underscore',
  'backbone',
  'config/conf'
], function(_, Backbone, ConfModel){
	var conf = new ConfModel();
 	var UserModel = Backbone.Model.extend({
  	initialize: function(options){
  		this.username = options.username;
      this.authToken = options.authToken;
  	},
  	url: function(){
  		return conf.get('smaug').url + ':' + conf.get('smaug').port + 
              '/users/'+this.username+"?token="+this.authToken;
  	}
  });
  
  // Return the model for the module
  return UserModel;
});