define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'collections/categories',
  'text!templates/home/homeTemplate.html',
  'text!templates/home/categoriesTemplate.html'
  ], 

  function($,_, Backbone, Handlebars, CategoriesCollection, homeTemplate, categoriesTemplate){

    var HomeView = Backbone.View.extend({
      el: $("#home"),

      events: {
      },

      initialize: function(){
        
        // Compile the template using Handlebars micro-templating
        this.homeCT = Handlebars.compile(homeTemplate);
        this.catCT = Handlebars.compile(categoriesTemplate);

        this.categories = new CategoriesCollection();
        this.categories.comparator = 'name';
        //underscore bind preserves the views scope so that this.categories is still 
        //defined in the success callback
        this.categories.on('sync',_.bind(this.success, this));
        this.categories.fetch();
      },
      render:function () {
        this.$el.html(this.homeCT({}));
        return this;
      },
      success: function(model, response)  {
        $('#left-panel').html(this.catCT({'categories': this.categories.toJSON()}));
        $("#categories-list").listview();
      },
    });
    return HomeView;
});
