define([
  'underscore',
  'backbone',
  // Pull in the Model module from above
  'models/message',
  'config/conf'
], function(_, Backbone, MessageModel, Conf){
    
    var MessageCollection = Backbone.Collection.extend({
      
      initialize: function(options){
        this.query_opts = {};
        this.query_opts.user_id = options.user_id;
        this.query_opts.offset= options.offset;
        this.query_opts.pageSize= options.pageSize;
        this.query_opts.token= options.token;
      },
      
      model: MessageModel,
      
      url: function(){
        return Conf.get('smaug').url + ':' + Conf.get('smaug').port + 
        '/users/'+this.query_opts.user_id+'/messages?offset='+this.query_opts.offset+'&pageSize='+this.query_opts.pageSize +
        '&token='+this.query_opts.token;
      }
    });
    
    // You don't usually return a collection instantiated
    return MessageCollection;
});