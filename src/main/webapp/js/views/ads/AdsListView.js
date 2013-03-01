define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'collections/items',
  'config/conf',
  'text!templates/ads/adsListTemplate.html',
  'text!templates/ads/adsMoreListTemplate.html'
  ], 

  function($,_, Backbone, Handlebars, ItemsCollection, ConfModel, adsListTemplate,adsMoreListTemplate){

    var AdsListView = Backbone.View.extend({
      el: "#home",


      events: {
      },

      initialize: function(options){
        this.conf = new ConfModel();
        
        /*Compile the template using Handlebars micro-templating*/
        this.adsCT = Handlebars.compile(adsListTemplate);
        this.adsMCT = Handlebars.compile(adsMoreListTemplate);

        this.dfd = options.deferred;
        this.query = null || options.q;
        this.page= options.page || 0;
        this.pageSize =  10 || conf.get('pageSize');
        this.cat_id = options.cat_id;

        this.opts = {country_id: 1, cat_id:options.cat_id, q:this.query, offset:this.page, pageSize: this.pageSize};

        this.items = new ItemsCollection(this.opts);
        this.items.on('sync',_.bind(this.items_success, this));
        this.items.fetch();

        //We are not able to attach this event in events: {}, because windows is not inside el.
        //Namespaced events. http://docs.jquery.com/Namespaced_Events (This is here to avoid a bug)
        $(window).bind("scroll."+options.cat_id, (_.bind(this.checkScroll,this)));
      },

      checkScroll: function () {
        var triggerPoint = 100; // 100px from the bottom
        if( !this.isLoading && $(window).scrollTop() + $(window).height() + triggerPoint > $(document).height()  ) {
          console.log("Page:"+this.page);
          this.opts.offset += 1; // Load next page
          this.items.reset(this.opts);
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
        $(this.el).find('#content').html(this.adsCT({'items': this.items.toJSON(), 'search-term': this.query}));
        $(this.el).find('#ads-list').listview();
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
        $(window).unbind("scroll."+this.cat_id);
      }
    });
    return AdsListView;
});
