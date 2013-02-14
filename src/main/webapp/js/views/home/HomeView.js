define([
  'jquery',
  'underscore',
  'backbone',
  'swipe',
  'handlebars',
  'collections/categories',
  'collections/items',
  'text!templates/home/homeTemplate.html',
  'text!templates/home/categoriesTemplate.html',
  'text!templates/home/sliderTemplate.html'
  ], 

  function($,_, Backbone, sw, Handlebars, CategoriesCollection, ItemsCollection, 
    homeTemplate, categoriesTemplate, sliderTemplate){

    var HomeView = Backbone.View.extend({
      el: $("#home"),

      events:{
      },

      initialize: function(){
        
        // Compile the template using Handlebars micro-templating
        this.homeCT = Handlebars.compile(homeTemplate);
        this.catCT = Handlebars.compile(categoriesTemplate);
        this.sliderCT = Handlebars.compile(sliderTemplate);

        this.categories = new CategoriesCollection();
        this.categories.comparator = 'name';
        //underscore bind preserves the views scope so that this.categories is still 
        //defined in the success callback
        this.categories.on('sync',_.bind(this.cat_success, this));
        this.categories.fetch();

        this.items = new ItemsCollection({country_id:1});
        this.items.on('sync',_.bind(this.items_success, this));
        this.items.fetch();

      },
      render:function (){
        this.$el.html(this.homeCT({}));
        
        return this;
      },
      cat_success: function(model, response){
        $('#left-panel').html(this.catCT({'categories': this.categories.toJSON()}));
        $("#categories-list").listview();
      },
      items_success: function(model, response){
        $("#slider1").html(this.sliderCT({'items': this.items.toJSON()}));
        this.slider1 = new Swipe(document.getElementById('slider1'));
      },
    });
    return HomeView;
});
