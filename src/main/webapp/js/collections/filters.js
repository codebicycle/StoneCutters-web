define([
  'underscore',
  'backbone',
  // Pull in the Model module from above
  'models/filter',
  'config/conf',
  'helpers/CategoryHelper'
], function(_, Backbone, FilterModel, Conf, CategoryHelper){
    var FilterCollection = Backbone.Collection.extend({
      model: FilterModel,
      initialize: function(options){
        
      },
      url: function(){

        return Conf.get('smaug').url + ':' + Conf.get('smaug').port + 
        '/countries/'+ 'www.olx.com' + '/categories/' + CategoryHelper.getCategory() + 
        '/filters';
      },
    });
    // You don't usually return a collection instantiated
    return FilterCollection;
});