define([
  'jquery',
  'underscore',
  'backbone',
  'swipe',
  'handlebars',
  'models/item',
  'text!templates/item/itemTemplate.html'
  ], 

  function($,_, Backbone, sw, Handlebars, ItemModel, itemTemplate){

    var ItemView = Backbone.View.extend({
      el: "#home",

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
        document.title = this.item.get('title');
        $(this.el).find('#content').html(this.itemCT({'item': this.item.toJSON()}));
        this.slider = new Swipe(document.getElementById('image-slider'), {
                            //startSlide: 2,
                            //speed: 400,
                            //auto: 3000,
                            'items':2, //this should be set according to the device's width
                            'callback': function(event, index, elem) {
                            }
        });
        return this;
      },
      success: function(model, response)  {
        this.dfd.resolve(this);
        return;
      },
    });
  return ItemView;
});
