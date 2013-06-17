define([
  'underscore',
  'backbone',
  'config/conf'
], function(_, Backbone, Conf){
 	var UserModel = Backbone.Model.extend({
  	initialize: function(options){
      
  	}
  });
  
  // Return the model for the module
  return UserModel;
});