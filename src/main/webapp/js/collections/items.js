define([
  'underscore',
  'backbone',
  // Pull in the Model module from above
  'models/item',
  'config/conf',
  'helpers/JSONHelper',
  'helpers/CategoryHelper'
], function(_, Backbone, ItemModel, ConfModel, JSONHelper, CategoryHelper){
  	var conf = new ConfModel();
    var ItemCollection = Backbone.Collection.extend({
     	initialize: function(query_options, url_options, item_options){
        this.query_opts = null || query_options;
        
        var category = {"category_id":CategoryHelper.getCategory()};
        this.query_opts = JSONHelper.concatJSON(query_options, category);

        this.url_options = null || url_options;
        this.item_options = null || item_options;
      },
      model: ItemModel,
      url: function(){
        var response;

        //***********-----------------------
        //WARNING!!:
        //Comment or DELETE the following line in order to get the right logic.
        this.item_options.item_type='adsList';
        //***********-----------------------

        switch(this.item_options.item_type){

          case "adsList":
            response = conf.get('smaug').url + ':' + conf.get('smaug').port + '/items/'+ JSON.stringify(this.query_opts);
          break;
          case "myAds":
            response = conf.get('smaug').url + ':' + conf.get('smaug').port + '/users/' + this.url_options.user_id + '/ads?offset='+this.query_opts.offset+'&pageSize='+this.query_opts.pageSize;
          break;
          case "myFavorites":
            response = conf.get('smaug').url + ':' + conf.get('smaug').port + '/users/' + this.url_options.user_id + '/favorites?offset='+this.query_opts.offset+'&pageSize='+this.query_opts.pageSize;
          break;
        }
        return response;
      },
    });

    // You do not usually return a collection instantiated
    return ItemCollection;
});