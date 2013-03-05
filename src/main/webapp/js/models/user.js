define([
  'underscore',
  'backbone',
  'config/conf'
], function(_, Backbone, ConfModel){
	var conf = new ConfModel();
 	var UserModel = Backbone.Model.extend({
  	initialize: function(options){
  		this.id = options.id;
  	},
  	url: function(){
  		return conf.get('smaug').url + ':' + conf.get('smaug').port + '/user/'+this.id;
  	}
  });
  
  // Return the model for the module
  return UserModel;
});