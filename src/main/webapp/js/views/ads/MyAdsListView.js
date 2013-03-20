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
  ], 

  function($,_, Backbone, Handlebars, ItemsCollection, FiltersCollection, 
    SortsCollection, MyAdsListTemplate,adsMoreListTemplate){

    var MyAdsListView = Backbone.View.extend({
      el: "#home",

      events: {
      },

      initialize: function(options){
        
        /*Compile the template using Handlebars micro-templating*/
        this.adsCT = Handlebars.compile(MyAdsListTemplate);
        this.adsMCT = Handlebars.compile(adsMoreListTemplate);

        this.dfd = null || options.deferred;
        this.page= options.page || 0;
        this.pageSize =  10;
        this.user_id = this.Storage.get("userObj").id;
        
        this.ops = {country_id: 1, offset:this.page, pageSize: this.pageSize};
        this.items = new ItemsCollection(this.ops, {"user_id":this.user_id}, {"item_type":"myAds"});
        this.items.on('sync',_.bind(this.items_success, this));
        this.items.fetch();

        //We are not able to attach this event in events: {}, because windows is not inside el.
        //Namespaced events. http://docs.jquery.com/Namespaced_Events (This is here to avoid a bug)
        $(window).bind("scroll.myAds"+this.user_id, (_.bind(this.checkScroll,this)));
      },

      checkScroll: function () {
        var triggerPoint = 100; // 100px from the bottom
        if( !this.isLoading && $(window).scrollTop() + $(window).height() + triggerPoint > $(document).height()  ) {
          this.ops.offset += 1; // Load next page
          this.items.reset(this.ops);
          this.loadResults();
        }
      },

      loadResults: function () {
        this.items.on('sync',_.bind(this.load_more_items, this));
        this.isLoading = true;
        this.items.fetch();
      },

      load_more_items:function(items){
        $(this.el).find('#ads-list').append(this.adsMCT({'items': this.items.toJSON(), 'search-term': this.query}));
        $(this.el).find('#ads-list').listview("refresh");
        this.isLoading = false;
        return this;
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
      close: function(){
        $(window).unbind("scroll.myAds"+this.user_id);
      }
    });
    return MyAdsListView;
});
