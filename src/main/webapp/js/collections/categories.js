define([
  'underscore',
  'backbone',
  // Pull in the Model module from above
  'models/category'
], function(_, Backbone, CategoryModel){
  var CategoryCollection = Backbone.Collection.extend({
    model: CategoryModel
  });
  // You don't usually return a collection instantiated
  return CategoryCollection;
});