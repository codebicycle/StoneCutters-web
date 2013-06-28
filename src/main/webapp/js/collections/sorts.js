define([
  'underscore',
  'backbone',
  // Pull in the Model module from above
  'models/sort',
  'config/conf',
  'helpers/CategoryHelper'
], function(_, Backbone, SortModel, Conf, CategoryHelper){
    var SortCollection = Backbone.Collection.extend({
      model: SortModel,
      initialize: function(options){

      },
      url: function(){

        return Conf.get('smaug').url + ':' + Conf.get('smaug').port + 
        '/countries/'+ "www.olx.com" + '/categories/' + CategoryHelper.getCategory() + 
        "/sorts";
      },
    });
    // You don't usually return a collection instantiated
    return SortCollection;
});