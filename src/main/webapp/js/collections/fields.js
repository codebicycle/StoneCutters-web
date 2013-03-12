define([
  'underscore',
  'backbone',
  // Pull in the Model module from above
  'models/field',
  'config/conf'
], function(_, Backbone, FieldModel, ConfModel){
    var conf = new ConfModel();
    var FieldCollection = Backbone.Collection.extend({
      model: FieldModel,
      initialize: function(options){
        this.countryId = options.country_id;
        this.categoryId = options.category_id;
      },
      url: function(){
        return conf.get('smaug').url + ':' + conf.get('smaug').port + 
        '/fields/'+ this.countryId + '/' + this.categoryId;
      },
    });
    // You don't usually return a collection instantiated
    return FieldCollection;
});