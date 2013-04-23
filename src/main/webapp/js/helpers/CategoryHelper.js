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
      this.categories.on('sync',_.bind(this.cat_success, this));

      // this.on("change", function(model){
      //     console.log(model.get("category")+"-"+model.get("parent_category"));
      // });
    },
    isParent: function(cat){
      return _.contains(this.categories.pluck("id"),cat);
    },
    getChild: function(sCat){
      return this.children.get(sCat);
    },
    //this creates a new collection with all the children for easy access
    cat_success: function(model, response){
      this.children = new CategoriesCollection();

      this.categories.each(function(cat){
        chs = cat.get('children');
        for (var i = 0; i < chs.length; i++) {
          this.children.add(chs[i]);
        };
      }, this);
    },
  });

  return new CategoryHelper();
});