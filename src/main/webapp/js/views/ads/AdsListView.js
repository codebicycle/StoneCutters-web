define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'collections/items',
  'collections/filters',
  'collections/sorts',
  'config/conf',
  'text!templates/ads/adsListTemplate.html',
  'text!templates/ads/adsMoreListTemplate.html',
  'text!templates/ads/filterTemplate.html',
  'text!templates/ads/sortTemplate.html',
  'helpers/JSONHelper'
  ], 

  function($,_, Backbone, Handlebars, ItemsCollection, FiltersCollection, 
    SortsCollection, ConfModel, adsListTemplate,adsMoreListTemplate, 
    filterTemplate, sortTemplate, JSONHelperModel){

    var AdsListView = Backbone.View.extend({
      el: "#home",

      events: {
        'click #filterButton': 'openFilterPopup',
        'click #sortButton': 'openSortPopup',
      },

      initialize: function(options){
        this.conf = new ConfModel();
        var jsonHelper = new JSONHelperModel();
        
        /*Compile the template using Handlebars micro-templating*/
        this.adsCT = Handlebars.compile(adsListTemplate);
        this.adsMCT = Handlebars.compile(adsMoreListTemplate);
        this.filCT = Handlebars.compile(filterTemplate);
        this.sorMCT = Handlebars.compile(sortTemplate);

        this.params = jsonHelper.parseQueryString(options.params);
        this.dfd = null || options.deferred;
        this.query = null || this.params.q;
        this.page= options.page || 0;
        this.pageSize =  10 || conf.get('pageSize');
        this.cat_id = options.cat_id;
        
        var ops = {country_id: 1, category_id:options.cat_id, q:this.query, 
          offset:this.page, pageSize: this.pageSize};
        ops = jsonHelper.concatJSON(ops, this.params)

        var Opts = Backbone.Model.extend();
        this.opts = new Opts(ops);
        this.opts.on('change', this.updateItems, this);

        this.items = new ItemsCollection(this.opts.toJSON());
        this.items.on('sync',_.bind(this.items_success, this));
        this.items.fetch();

        this.filters = new FiltersCollection(this.opts.toJSON());
        this.filters.on('sync',_.bind(this.filters_success, this));
        this.filters.fetch();

        this.sorts = new SortsCollection(this.opts.toJSON());
        this.sorts.on('sync',_.bind(this.sorts_success, this));
        this.sorts.fetch();

        //MOCK CODE
        // this.filters = new FiltersCollection([
        //     {title:"Year", options:[{opTitle:"1980"},{opTitle:"1981"},{opTitle:"1982"}]},
        //     {title:"Color", options:[{opTitle:"Red"},{opTitle:"Blue"}]},
        //     {title:"Length", options:[{opTitle:"100"}]},
        //     {title:"Model", options:[{opTitle:"A"},{opTitle:"B"},{opTitle:"C"}]},
        //   ]);

        // this.sorts = new SortsCollection([{title:"Date"},{title:"Price"}]);

        //We are not able to attach this event in events: {}, because windows is not inside el.
        //Namespaced events. http://docs.jquery.com/Namespaced_Events (This is here to avoid a bug)
        $(window).bind("scroll."+options.cat_id, (_.bind(this.checkScroll,this)));
      },

      checkScroll: function () {
        var triggerPoint = 100; // 100px from the bottom
        if( !this.isLoading && $(window).scrollTop() + $(window).height() + triggerPoint > $(document).height()  ) {
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
        $(this.el).find('#content').html(this.adsCT({'items': this.items.toJSON(), 
          'filters': this.filters.toJSON(), 'search-term': this.query,
          'sorts':this.sorts.toJSON(), 'added-filters':this.params}));
        $(this.el).find('#content').trigger('create');

        $('a[class*=filter]').click({opts: this.opts},function(ev){
          var filter = $(ev.currentTarget).closest('ul').data('filtername');
          var value = $(ev.currentTarget).html();

          ev.data.opts.set(filter,value);
        });

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
      updateItems: function(){
        var url;

        if (this.opts.get("cat_id")) {
          url = "#category/"+this.opts.get("cat_id")+"/";
        }else if(this.opts.get("q")){
          url = "#search?";
        }else{return};

        for (var key in this.opts.attributes) {
          if (this.opts.attributes[key] && key != "cat_id")
            url += key + "=" + this.opts.attributes[key] + "&";
        };

        url = url.substring(0,url.length-1);
        window.location = url;

      },
      filters_success: function(model, response)  {
        $(this.el).find('#filterPopup').html(this.filCT({
          'filters': this.filters.toJSON()}));
        $(this.el).find('#filterPopup').trigger('create');
      },
      sorts_success: function(model, response)  {
        $(this.el).find('#sortPopup').html(this.sorCT({
          'sorts':this.sorts.toJSON()}));
        $(this.el).find('#sortPopup').trigger('create');
      },
      close: function(){
        $(window).unbind("scroll."+this.cat_id);
      },
      openFilterPopup: function(){
        $('#filterPopup').popup("open", {transition:"slideup"});
      },
      openSortPopup: function(){
        $('#sortPopup').popup("open", {transition:"slideup"});
      }
    });
    return AdsListView;
});
