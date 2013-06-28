define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'constants/const',
  'collections/items',
  'collections/filters',
  'collections/sorts',
  'text!templates/ads/myFavoriteAdsTemplate.html',
  'text!templates/ads/myFavoriteAdsListTemplate.html',
  'views/scroll/ScrollView'
  ], 

  function($,_, Backbone, Handlebars, Const, ItemsCollection, FiltersCollection, 
    SortsCollection, myFavoriteAdsTemplate,myFavoriteAdsListTemplate, ScrollView){

    var MyFavoritesAdsListView = ScrollView.extend({
      el: "#home",
      className: "MyFavoritesAdsListView",

      events: {
      },

      initialize: function(options){
        
        /*Compile the template using Handlebars micro-templating*/
        this.myFavCT = Handlebars.compile(myFavoriteAdsTemplate);
        this.myFavListCT= MyFavoritesAdsListView.__super__.listTemplate= Handlebars.compile(myFavoriteAdsListTemplate);

        this.dfd = null || options.deferred;
        this.page= options.page || 0;
        MyFavoritesAdsListView.__super__.offset = options.page || 0; 
        MyFavoritesAdsListView.__super__.itemListId = "#ads-list";
        
        this.item_ops = {"item_type":"myFavorites"};

        var ops = {
          token: this.Storage.get("userObj").authToken,
          offset:this.page,
          pageSize: Const.get(this.className).pageSize
        };

        var Opts = Backbone.Model.extend();
        MyFavoritesAdsListView.__super__.query_options = new Opts(ops);
        this.query_options = MyFavoritesAdsListView.__super__.query_options;

        this.items = new ItemsCollection(this.item_ops);
        MyFavoritesAdsListView.__super__.collection = this.items;
        this.items.on('sync',_.bind(this.items_success, this));
        this.items.fetch({data: $.param(this.query_options.toJSON())});

        //ScrollView Settings
        this.templateKey = "items";
        this.scrollingID = this.cid;
        MyFavoritesAdsListView.__super__.bindScrolling.call(this);
      },

      render:function () {
        $(this.el).find('#content').html(this.myFavCT());
        $(this.el).find('#ads-list').html(this.myFavListCT({'items': this.items.toJSON()}));
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
      }      
    });
    return MyFavoritesAdsListView;
});