define([
  'underscore',
  'backbone',
  // Pull in the Model module from above
  'models/field',
  'config/conf'
], function(_, Backbone, FieldModel, Conf){
    var FieldCollection = Backbone.Collection.extend({
      model: FieldModel,
      initialize: function(options){
        this.countryId = options.country_id;
        this.categoryId = options.category_id;
      },
      url: function(){
        return Conf.get('smaug').url + ':' + Conf.get('smaug').port + 
        '/fields/'+ this.countryId + '/' + this.categoryId;
      },
    });
    // You don't usually return a collection instantiated
    return FieldCollection;
});