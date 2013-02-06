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
      el: "#home",

      initialize: function(){
      this.collection = new CategoriesCollection();
      this.collection.add({ name: "Category 1", pageNum: 1});
      this.collection.add({ name: "Category 2", pageNum: 2});
      
      // Compile the template using Handlebars micro-templating
      this.compiledTemplate = Handlebars.compile(homeTemplate);
    },
      render:function () {
      
        this.$el.html(this.compiledTemplate({'categories': this.collection.toJSON()}));
        return this;
    }

    });
    return HomeView;
});
