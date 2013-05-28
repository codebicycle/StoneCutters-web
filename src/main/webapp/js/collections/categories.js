define([
  'underscore',
  'backbone',
  // Pull in the Model module from above
  'models/category',
  'config/conf'
], function(_, Backbone, CategoryModel, Conf){
    var CategoryCollection = Backbone.Collection.extend({
      model: CategoryModel,
      url: Conf.get('smaug').url + ':' + Conf.get('smaug').port + '/countries/www.olx.com/categories'
    });
    // You don't usually return a collection instantiated
    return CategoryCollection;
});