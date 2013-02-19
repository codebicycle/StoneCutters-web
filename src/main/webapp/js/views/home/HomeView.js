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
        "click #p-cat-link": "showParentCategories"
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
        $("#p-cat-link").button();
        $("#p-cat-link").hide();
      },
      items_success: function(model, response){
        $("#slider1").html(this.sliderCT({'items': this.items.toJSON()}));
        this.slider1 = new Swipe(document.getElementById('slider1'), {
                            //startSlide: 2,
                            //speed: 400,
                            //auto: 3000,
                            'items':3,
                            'callback': function(event, index, elem) {
                            }
        });
      },
      refreshList: function(ev){
        var data_id = $(ev.currentTarget).data("id");
        var parent_id = $(ev.currentTarget).data("parentId");
        var category = null;

        if (parent_id) {
          var parentCategory = this.categories.get(parent_id);
          var children = new CategoriesCollection(parentCategory.get('children'));
          category = children.get(data_id);
          $('#left-panel').panel("close");
        }else{
          category = this.categories.get(data_id);
        }

        if (category.get('children').length > 0) {
          this.cat_success({}, category.get('children'));
        }

        if (!parent_id) {
          $("#p-cat-link").show();
        }

        //deselects the currently selected sub-category
        $('.ui-li').removeClass('ui-focus');
        
      },
      showParentCategories: function(){
        this.cat_success([],this.categories.toJSON());
        $("#p-cat-link").hide();
      },
    });
    return HomeView;
});
