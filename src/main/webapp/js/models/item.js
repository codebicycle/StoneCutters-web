define([
  'underscore',
  'backbone',
  'config/conf'
], function(_, Backbone, ConfModel){
	var conf = new ConfModel();
 	var ItemModel = Backbone.Model.extend({
  	initialize: function(options){
  		this.id = options.id;
  	},
  	url: function(){
  		return conf.get('smaug').url + ':' + conf.get('smaug').port + '/item/'+this.id;
  	}
  });
  
  // Return the model for the module
  return ItemModel;
});