//Singleton class. See the return line
define([
  'underscore',
  'backbone',
  'collections/categories',
], function(_, Backbone, CategoriesCollection){
  var CategoryHelper = Backbone.Model.extend({
    defaults: {
      category: 0
    },
    getCategory: function(){
      return this.get("category");
    },
    setCategory: function(cat){
      this.set("category",cat);
    },
    initialize: function(){
      this.categories = new CategoriesCollection();
      //this.categories.on('sync',_.bind(this.cat_success, this));

      // this.on("change", function(model){
      //     console.log(model.get("category")+"-"+model.get("parent_category"));
      // });
    },
    cat_success: function(model, response){
    },
  });

  return new CategoryHelper();
});