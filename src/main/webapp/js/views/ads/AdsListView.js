define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'collections/items',
  'collections/filters',
  'collections/sorts',
  'text!templates/ads/adsListTemplate.html',
  'text!templates/ads/adsMoreListTemplate.html',
  'text!templates/ads/filterTemplate.html',
  'text!templates/ads/sortTemplate.html',
  'views/scroll/ScrollView',
  'helpers/JSONHelper',
  'helpers/CategoryHelper'
  ], 

  function($,_, Backbone, Handlebars, ItemsCollection, FiltersCollection, 
    SortsCollection, adsListTemplate,adsMoreListTemplate, 
    filterTemplate, sortTemplate,ScrollView, JSONHelper, CategoryHelper){
  
    var AdsListView = ScrollView.extend({
      el: "#home",

      events: {
        'click #filterButton': 'openFilterPopup',
        'click #sortButton': 'openSortPopup',
      },

      initialize: function(options){
        
        /*Compile the template using Handlebars micro-templating*/
        this.adsCT = Handlebars.compile(adsListTemplate);
        AdsListView.__super__.moreTemplate = Handlebars.compile(adsMoreListTemplate);
        this.filCT = Handlebars.compile(filterTemplate);
        this.sorCT = Handlebars.compile(sortTemplate);

        this.params = JSONHelper.parseQueryString(options.params);
        this.dfd = null || options.deferred;
        this.query = null || this.params.q;
        this.sortName = null || this.params.sort;
        AdsListView.__super__.offset= options.page || 0;
        this.pageSize =  10;

        //this sets the category and parent category in the Category Helper
        if (options.cat_id)
          CategoryHelper.setCategory(parseInt(options.cat_id,10));

        var ops = {countryId: 1, offset:AdsListView.__super__.offset, pageSize: this.pageSize};
        delete this.params["q"];


        ops = JSONHelper.concatJSON(ops, this.params)
        
        if(this.query){
          ops = JSONHelper.concatJSON(ops, {"searchQuery":this.query});
        }
        
        delete this.params["sort"];

        var Opts = Backbone.Model.extend();
        this.query_options = new Opts(ops);
        this.query_options.on('change', this.updateItems, this);

        AdsListView.__super__.collection = new ItemsCollection(this.query_options.toJSON(),{},{"item_type":"adsList"});
        this.items = AdsListView.__super__.collection;
        this.items.on('sync',_.bind(this.items_success, this));
        this.items.fetch();

        this.filters = new FiltersCollection(this.query_options.toJSON());
        this.filters.on('sync',_.bind(this.filters_success, this));
        this.filters.fetch();

        this.sorts = new SortsCollection(this.query_options.toJSON());
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
        //End of Mock code

        //ScrollView's settings
        this.templateKey = "items";
        this.scrollingID = options.cat_id;
        AdsListView.__super__.bindScrolling.call(this);
      },

      render:function () {
        $(this.el).find('#content').html(this.adsCT({'items': this.items.toJSON(), 
          'search-term': this.query,
          'added-filters':JSONHelper.parseTitleValue(this.params),
          'sortName':this.sortName
        }));

        //Mock code lines
        // $(this.el).find('#filterPopup').html(this.filCT({
        //   'filters': this.filters.toJSON()}));
        // $(this.el).find('#sortPopup').html(this.sorCT({
        //   'sorts':this.sorts.toJSON()}));
        //End of Mock code lines

        $(this.el).find('#content').trigger('create');

        $('a[class*=filter]').click({opts: this.query_options},function(ev){
          var filter = $(ev.currentTarget).closest('ul').data('filtername');
          var value = $(ev.currentTarget).html();
          ev.data.opts.set(filter,value);
        });

        $('a[class*=sort]').click({opts: this.query_options},function(ev){
          var sort = $(ev.currentTarget).data('sortname');
          ev.data.opts.set("sort",sort);
        });

        $('a[class*=remove-filter]').click({opts: this.query_options},function(ev){
          var filter = $(ev.currentTarget).data('filtername');
          ev.data.opts.unset(filter);
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

        if (!this.opts.get("q")) {
          url = "#category/"+this.opts.get("category_id")+"/";
        }else{
          url = "#search?";
        };

        for (var key in this.opts.attributes) {
          if (this.opts.attributes[key] && key != "category_id"
            && key != "country_id" && key != "pageSize")
            url += key + "=" + this.opts.attributes[key] + "&";
        };

        url = url.substring(0,url.length-1);
        window.location = url;
      },

      filters_success: function(model, response){
        $(this.el).find('#filterPopup').html(this.filCT({
          'filters': this.filters.toJSON()}));
        $(this.el).find('#filterPopup').trigger('create');
      },

      sorts_success: function(model, response){
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