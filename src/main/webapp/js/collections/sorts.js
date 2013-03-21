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
        this.countryId = options.countryId;
        this.query = options.q;
      },
      url: function(){
        var q_param = "";
        if (this.query)
          q_param = '?q=' + this.query;

        return Conf.get('smaug').url + ':' + Conf.get('smaug').port + 
        '/sorts/'+ this.countryId + '/' + CategoryHelper.getCategory() + q_param;
      },
    });
    // You don't usually return a collection instantiated
    return SortCollection;
});