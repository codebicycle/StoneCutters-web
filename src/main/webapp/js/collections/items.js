define([
  'underscore',
  'backbone',
  'models/item',
  'config/conf',
  'helpers/JSONHelper',
  'helpers/CategoryHelper'
], function(_, Backbone, ItemModel, Conf, JSONHelper, CategoryHelper){
    var ItemCollection = Backbone.Collection.extend({
     	initialize: function(item_options){
        this.item_options = item_options || {item_type: "adsList"};
      },

      model: ItemModel,

      url: function(){
        var url;
        
        switch(this.item_options.item_type){

          case "adsList":
            url = Conf.get('smaug').url + ':' + Conf.get('smaug').port + '/items';
          break;
          case "myAds":
            url = Conf.get('smaug').url + ':' + Conf.get('smaug').port + '/users/'+this.Storage.get("userObj").userId+'/items';
          break;
          case "myFavorites":
            url = Conf.get('smaug').url + ':' + Conf.get('smaug').port + '/users/'+this.Storage.get("userObj").userId+'/favorites';
          break;
        }
        return url;
      },
    });

    return ItemCollection;
});