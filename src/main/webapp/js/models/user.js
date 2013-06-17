define([
  'underscore',
  'backbone',
  'config/conf'
], function(_, Backbone, Conf){
 	var UserModel = Backbone.Model.extend({
  	initialize: function(options){
		this.userId = options.userId;
		this.username = options.username;
        this.authToken = options.token;
        this.unreadMessagesCount = options.unreadMessagesCount;
        this.favorites = options.favorites;
  	}
  });
  
  // Return the model for the module
  return UserModel;
});