define([
  'underscore',
  'backbone',
  // Pull in the Model module from above
  'models/field',
  'config/conf'
], function(_, Backbone, FieldModel, Conf){
    var FieldCollection = Backbone.Collection.extend({
      model: FieldModel,
      url: function(){
        return Conf.get('smaug').url + ':' + Conf.get('smaug').port + 
        '/countries/'+ this.countryId + '/categories/' + this.categoryId + '/optionals';
      },
    });
    // You don't usually return a collection instantiated
    return FieldCollection;
});