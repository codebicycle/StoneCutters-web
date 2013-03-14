define([
  'underscore',
  'backbone',
  // Pull in the Model module from above
  'models/message',
  'config/conf'
], function(_, Backbone, MessageModel, ConfModel){
    
    var conf = new ConfModel();
    var MessageCollection = Backbone.Collection.extend({
      
      initialize: function(options){
        this.user_id = options.user_id;
        this.offset= options.offset;
        this.pageSize= options.pageSize;
      },
      
      model: MessageModel,
      
      url: function(){
        //Due to the fact that Smaug is drunk, the following line is commented, but we must uncomment the line for production.
        //return conf.get('smaug').url + ':' + conf.get('smaug').port + '/users/'+this.user_id+'/messages?offset='+this.offset+'&pageSize='+this.pageSize
        this.query_opts = {country_id: 1, cat_id:16, q:null, offset:0, pageSize: 10};
        return conf.get('smaug').url + ':' + conf.get('smaug').port + '/items/'+ JSON.stringify(this.query_opts);
      }
    });
    
    // You don't usually return a collection instantiated
    return MessageCollection;
});