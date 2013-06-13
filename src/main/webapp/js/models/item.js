define([
  'underscore',
  'backbone',
  'config/conf'
], function(_, Backbone, Conf){
 	var ItemModel = Backbone.Model.extend({
  	initialize: function(options){
      if(options != undefined){
        this.id = options.id;   
      }
  	},
  	urlRoot: function(){
  		return Conf.get('smaug').url + ':' + Conf.get('smaug').port + '/items';
  	}
  });
  
  // Return the model for the module
  return ItemModel;
});