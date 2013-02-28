define([
  'underscore',
  'backbone',
  // Pull in the Model module from above
  'models/item',
  'config/conf'
], function(_, Backbone, ItemModel, ConfModel){
  	var conf = new ConfModel();
    var ItemCollection = Backbone.Collection.extend({
     	initialize: function(options){
        this.query_opts = options;
      },
      model: ItemModel,
      url: function(){
        return conf.get('smaug').url + ':' + conf.get('smaug').port + '/items/'+ JSON.stringify(this.query_opts);
      },
    });

    // You don't usually return a collection instantiated
    return ItemCollection;
});