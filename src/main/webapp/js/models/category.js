define([
  'underscore',
  'backbone'
], function(_, Backbone){
  var CategoryModel = Backbone.Model.extend();
  
  // Return the model for the module
  return CategoryModel;
});