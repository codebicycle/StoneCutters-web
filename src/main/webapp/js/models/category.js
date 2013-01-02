define([
  'underscore',
  'backbone'
], function(_, Backbone){
  var CategoryModel = Backbone.Model.extend({
    defaults: {
      name: "Comprar"
    }
  });
  
  // Return the model for the module
  return CategoryModel;
});