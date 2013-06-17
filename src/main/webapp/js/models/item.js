define([
  'underscore',
  'backbone',
  'config/conf'
], function(_, Backbone, Conf){
 	var ItemModel = Backbone.Model.extend({
  	initialize: function(options){
      
  	},
  	urlRoot: function(){
  		return Conf.get('smaug').url + ':' + Conf.get('smaug').port + '/items';
  	}
  });
  
  // Return the model for the module
  return ItemModel;
});