define([
  'underscore',
  'backbone',
  // Pull in the Model module from above
  'models/item',
  'config/conf'
], function(_, Backbone, ItemModel, ConfModel){
  	var conf = new ConfModel();
    var ItemCollection = Backbone.Collection.extend({
     	initialize: function(options, user_id){
        this.query_opts = options;
        this.user_id = user_id || null;
      },
      model: ItemModel,
      url: function(){
        var response;
        

        //***********-----------------------
        //WARNING!!:
        //Comment or DELETE the following line in order to get the right logic.
        this.user_id=null;
        //***********-----------------------

        if(this.user_id==null)
          response = conf.get('smaug').url + ':' + conf.get('smaug').port + '/items/'+ JSON.stringify(this.query_opts);
        else
          response = conf.get('smaug').url + ':' + conf.get('smaug').port + '/users/' + this.user_id + '/ads?offset='+this.query_opts.offset+'&pageSize='+this.query_opts.pageSize;
        return response;
      },
    });

    // You don't usually return a collection instantiated
    return ItemCollection;
});