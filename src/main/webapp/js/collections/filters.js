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
        this.countryId = options.countryId;
        this.query = options.q;
      },
      url: function(){
        var q_param = "";
        if (this.query)
          q_param = '?q=' + this.query;

        return Conf.get('smaug').url + ':' + Conf.get('smaug').port + 
        '/filters/'+ this.countryId + '/' + CategoryHelper.getCategory() + q_param;
      },
    });
    // You don't usually return a collection instantiated
    return FilterCollection;
});