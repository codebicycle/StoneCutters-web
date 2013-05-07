define([
  'underscore',
  'backbone',
  'config/conf'
], function(_, Backbone, Conf){
 	var ItemModel = Backbone.Model.extend({
  	initialize: function(options){
  		this.id = options.id;
  	},
  	url: function(){
  		return Conf.get('smaug').url + ':' + Conf.get('smaug').port + '/items/'+this.id;
  	}
  });
  
  // Return the model for the module
  return ItemModel;
});