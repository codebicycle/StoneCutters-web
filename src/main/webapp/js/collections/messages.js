define([
  'underscore',
  'backbone',
  // Pull in the Model module from above
  'models/message',
  'config/conf'
], function(_, Backbone, MessageModel, Conf){
    
    var MessageCollection = Backbone.Collection.extend({
      
      initialize: function(options){

      },
      
      model: MessageModel,
      
      url: function(){
        return Conf.get('smaug').url + ':' + Conf.get('smaug').port + 
        '/users/'+this.Storage.get("userObj").userId+'/messages';
      }
    });
    
    // You don't usually return a collection instantiated
    return MessageCollection;
});