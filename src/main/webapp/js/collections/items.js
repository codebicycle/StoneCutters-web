define([
  'underscore',
  'backbone',
  // Pull in the Model module from above
  'models/item',
  'config/conf'
], function(_, Backbone, ItemModel, ConfModel){
  	var conf = new ConfModel();
    var ItemCollection = Backbone.Collection.extend({
     	model: ItemModel,
     	url: conf.get('smaug').url + ':' + conf.get('smaug').port + '/items?country_id=1&category_id=2'
    });
    // You don't usually return a collection instantiated
    return ItemCollection;
});