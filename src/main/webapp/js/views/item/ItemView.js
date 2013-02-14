define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'models/item',
  'text!templates/item/itemTemplate.html'
  ], 

  function($,_, Backbone, Handlebars, ItemModel, itemTemplate){

    var ItemView = Backbone.View.extend({
      el: $("#item"),

      events: {
      },

      initialize: function(itemId){
        
        /*Compile the template using Handlebars micro-templating*/
        this.itemCT = Handlebars.compile(itemTemplate);

        this.item = new ItemModel(itemId);
        this.item.on('sync',_.bind(this.success, this));
        this.item.fetch();
      },
      render:function () {
        console.log("rendering Item view...")
        this.$el.html(this.itemCT(this.item));
        return this;
      },
      success: function(model, response)  {
        //this.render();
        return;
      },
    });
    return ItemView;
});
