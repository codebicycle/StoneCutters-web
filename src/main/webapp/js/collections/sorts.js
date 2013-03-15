define([
  'underscore',
  'backbone',
  // Pull in the Model module from above
  'models/sort',
  'config/conf'
], function(_, Backbone, SortModel, ConfModel){
    var conf = new ConfModel();
    var SortCollection = Backbone.Collection.extend({
      model: SortModel,
      initialize: function(options){
        this.countryId = options.country_id;
        this.categoryId = options.category_id;
      },
      url: function(){
        return conf.get('smaug').url + ':' + conf.get('smaug').port + 
        '/sorts/'+ this.countryId + '/' + this.categoryId;
      },
    });
    // You don't usually return a collection instantiated
    return SortCollection;
});