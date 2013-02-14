define([
  'underscore',
  'backbone'
], function(_, Backbone){
  var ItemModel = Backbone.Model.extend({
  	url: conf.get('smaug').url + ':' + conf.get('smaug').port + '/item/1'
  });
  
  // Return the model for the module
  return ItemModel;
});