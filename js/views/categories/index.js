define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'collections/categories',
  'text!templates/category/index.html'
], 

function($, _, Backbone, Handlebars, CategoriesCollection, categoriesListTemplate){
  
  var CategoryListView = Backbone.View.extend({
    el: $("#categories-list"),

    initialize: function(){
      this.collection = new CategoriesCollection();
      this.collection.add({ name: "Category 1"});
      this.collection.add({ name: "Category 2"});
      
      // Compile the template using Handlebars micro-templating
      var compiledTemplate = Handlebars.compile(categoriesListTemplate);
      this.$el.html(compiledTemplate({'categories': this.collection.toJSON()}));
    }
  });
  
  // collection instantiated views can be quite useful for having "state"
  return CategoryListView;
});