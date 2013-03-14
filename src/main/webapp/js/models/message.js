define([
  'underscore',
  'backbone'
], function(_, Backbone, ConfModel){
 	var MessageModel = Backbone.Model.extend({
  	initialize: function(options){
  		this.id = options.id;
  	}  	
  });
  
  // Return the model for the module
  return MessageModel;
});