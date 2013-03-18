define([
  'underscore',
  'backbone',
  // Pull in the Model module from above
  'models/filter',
  'config/conf'
], function(_, Backbone, FilterModel, ConfModel){
    var conf = new ConfModel();
    var FilterCollection = Backbone.Collection.extend({
      model: FilterModel,
      initialize: function(options){
        this.countryId = options.country_id;
        this.categoryId = options.category_id;
        this.query = options.q;
      },
      url: function(){
        var path;
        if (this.categoryId) {
          path = '/' + this.categoryId;
        }else if (this.query) {
          path = '?q=' + this.query;
        };
        return conf.get('smaug').url + ':' + conf.get('smaug').port + 
        '/filters/'+ this.countryId + path;
      },
    });
    // You don't usually return a collection instantiated
    return FilterCollection;
});