define([
  'underscore',
  'backbone',
  // Pull in the Model module from above
  'models/sort',
  'config/conf',
  'helpers/CategoryHelper'
], function(_, Backbone, SortModel, ConfModel, CategoryHelper){
    var conf = new ConfModel();
    var SortCollection = Backbone.Collection.extend({
      model: SortModel,
      initialize: function(options){
        this.countryId = options.country_id;
        this.query = options.q;
      },
      url: function(){
        var q_param = "";
        if (this.query)
          q_param = '?q=' + this.query;

        return conf.get('smaug').url + ':' + conf.get('smaug').port + 
        '/sorts/'+ this.countryId + '/' + CategoryHelper.getCategory() + q_param;
      },
    });
    // You don't usually return a collection instantiated
    return SortCollection;
});