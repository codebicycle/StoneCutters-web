define([
  'jquery',
  'underscore',
  'backbone',
  'swipe',
  'handlebars',
  'collections/categories',
  'collections/items',
  'text!templates/home/homeTemplate.html',
  'text!templates/home/categoriesListTemplate.html',
  'text!templates/home/sliderTemplate.html'
  ], 

  function($,_, Backbone, sw, Handlebars, CategoriesCollection, ItemsCollection, 
    homeTemplate, categoriesListTemplate, sliderTemplate){

    var HomeView = Backbone.View.extend({
      el: $("#home"),

      events:{
        "click .cat-link": "refreshList", 
      },

      initialize: function(){
        
        // Compile the template using Handlebars micro-templating
        this.homeCT = Handlebars.compile(homeTemplate);
        this.catCT = Handlebars.compile(categoriesListTemplate);
        this.sliderCT = Handlebars.compile(sliderTemplate);

        this.categories = new CategoriesCollection();
        //this.categories.comparator = 'name';
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
        $('#left-panel').html(this.catCT({'categories': response}));
        $("#categories-list").listview();
      },
      items_success: function(model, response){
        $("#slider1").html(this.sliderCT({'items': this.items.toJSON()}));
        this.slider1 = new Swipe(document.getElementById('slider1'));
      },
      refreshList: function(ev){
        var data_id = $(ev.currentTarget).data("id");
        var parent_id = $(ev.currentTarget).data("parentId");
        var category = null;

        if (parent_id) {
          var parentCategory = this.categories.get(parent_id);
          var children = new CategoriesCollection(parentCategory.get('children'));
          category = children.get(data_id);
        }else{
          category = this.categories.get(data_id);
        };

        if (category.get('children').length > 0) {
          this.cat_success({}, category.get('children'));
        };

        //$(ev.currentTarget).removeClass('ui-btn-down-a ui-btn-down-b ui-btn-down-c ui-btn-down-d ui-btn-down-e ui-btn-hover-a  ui-btn-hover-b  ui-btn-hover-c  ui-btn-hover-d  ui-btn-hover-e');
        //$("#categories-list").listview('refresh');
      },
    });
    return HomeView;
});
