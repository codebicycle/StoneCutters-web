define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'collections/items',
  'collections/filters',
  'collections/sorts',
  'text!templates/ads/myAdsListTemplate.html',
  'text!templates/ads/adsMoreListTemplate.html',
  'views/scroll/ScrollView'
  ], 

  function($,_, Backbone, Handlebars, ItemsCollection, FiltersCollection, 
    SortsCollection, MyAdsListTemplate,adsMoreListTemplate, ScrollView){

    var MyAdsListView = ScrollView.extend({
      el: "#home",

      events: {
      },

      initialize: function(options){
        
        /*Compile the template using Handlebars micro-templating*/
        this.adsCT = Handlebars.compile(MyAdsListTemplate);
        MyAdsListView.__super__.moreTemplate  = Handlebars.compile(adsMoreListTemplate);

        this.dfd = null || options.deferred;
        this.page= options.page || 0;
        this.pageSize =  10;
        this.user_id = this.Storage.get("userObj").id;
        MyAdsListView.__super__.offset= options.page || 0;
        
        this.ops = {country_id: 1, offset:this.page, pageSize: this.pageSize};
        this.items = new ItemsCollection(this.ops, {"user_id":this.user_id}, {"item_type":"myAds"});
        MyAdsListView.__super__.collection = this.items;
        this.items.on('sync',_.bind(this.items_success, this));
        this.items.fetch();

        this.templateKey = "items";
        this.scrollingID = "myAds"+this.user_id;
        MyAdsListView.__super__.bindScrolling.call(this);
      },

      render:function () {
        $(this.el).find('#content').html(this.adsCT({'items': this.items.toJSON()}));
        $(this.el).find('#content').trigger('create');
         return this;
      },

      items_success: function(model, response)  {
        if (this.dfd) this.dfd.resolve(this);
        if (this.query) {
          //if this requests comes from a search, trigger the done event
          this.eventAggregator.trigger("searchDone");
        };
        return;
      },
    });
    return MyAdsListView;
});
