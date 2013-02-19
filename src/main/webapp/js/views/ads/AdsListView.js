define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'collections/items',
  'text!templates/ads/adsListTemplate.html'
  ], 

  function($,_, Backbone, Handlebars, ItemsCollection, adsListTemplate){

    var AdsListView = Backbone.View.extend({
      el: "#home",

      events: {
      },

      initialize: function(options){
        
        /*Compile the template using Handlebars micro-templating*/
        this.adsCT = Handlebars.compile(adsListTemplate);

        this.dfd = options.deferred;

        this.items = new ItemsCollection({country_id: 1, cat_id:options.cat_id});
        this.items.on('sync',_.bind(this.items_success, this));
        this.items.fetch();
      },
      render:function () {
        $(this.el).find('#content').html(this.adsCT({'items': this.items.toJSON()}));
        $(this.el).find('#ads-list').listview();
        return this;
      },
      items_success: function(model, response)  {
        this.dfd.resolve(this);
        return;
      },
    });
    return AdsListView;
});
