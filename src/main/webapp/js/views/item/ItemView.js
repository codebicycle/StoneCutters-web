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
      el: $("#home"),

      events: {
      },

      initialize: function(options){
        
        /*Compile the template using Handlebars micro-templating*/
        this.itemCT = Handlebars.compile(itemTemplate);
        this.dfd = options.deferred;

        this.item = new ItemModel({'id': options.id});
        this.item.on('sync',_.bind(this.success, this));
        this.item.fetch();
      },
      render:function () {
        $('#content').html(this.itemCT({'item': this.item.toJSON()}));
        return this;
      },
      success: function(model, response)  {
        this.dfd.resolve(this);
        return;
      },
    });
  return ItemView;
});
