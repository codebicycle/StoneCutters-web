define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'collections/categories',
  'text!templates/home/homeTemplate.html'
  ], 

  function($,_, Backbone, Handlebars, CategoriesCollection, homeTemplate){

    var HomeView = Backbone.View.extend({
      el: $("#home"),

      initialize: function(){
      this.collection = new CategoriesCollection();
      this.collection.add({ name: "Category 1", pageNum: 1});
      this.collection.add({ name: "Category 2", pageNum: 2});
      
      // Compile the template using Handlebars micro-templating
      var compiledTemplate = Handlebars.compile(homeTemplate);
      //console.log(compiledTemplate({'categories': this.collection.toJSON()}));
      this.$el.html(compiledTemplate({'categories': this.collection.toJSON()}));
    }
    });
    return HomeView;
});
