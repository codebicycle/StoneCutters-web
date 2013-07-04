define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'constants/const',
  'collections/items',
  'collections/filters',
  'collections/sorts',
  'text!templates/ads/adsTemplate.html',
  'text!templates/ads/adsListTemplate.html',
  'text!templates/ads/filterTemplate.html',
  'text!templates/ads/sortTemplate.html',
  'text!templates/base/breadcrumbTemplate.html',
  'views/scroll/ScrollView',
  'helpers/JSONHelper',
  'helpers/CategoryHelper'
  ], 

  function($,_, Backbone, Handlebars, Const, ItemsCollection, FiltersCollection, 
    SortsCollection, adsTemplate,adsListTemplate, 
    filterTemplate, sortTemplate, breadcrumbTemplate, ScrollView, JSONHelper, CategoryHelper){
  
    var AdsListView = ScrollView.extend({
      el: "#home",
      className: "AdsListView",

      events: {
        'click .toggle-popup': 'togglePopUp',
        'click .update-items': 'updateItems',
      },

      initialize: function(options){
        
        /*Compile the template using Handlebars micro-templating*/
        this.adsCT = Handlebars.compile(adsTemplate);
        this.adsListCT = AdsListView.__super__.listTemplate = Handlebars.compile(adsListTemplate);
        this.filCT = Handlebars.compile(filterTemplate);
        this.sorCT = Handlebars.compile(sortTemplate);
        this.breadCT = Handlebars.compile(breadcrumbTemplate);

        this.params = JSONHelper.parseQueryString(options.params);
        this.dfd = null || options.deferred;
        this.query = null || this.params.q;
        this.sortName = null || this.params.sort;
        AdsListView.__super__.offset= options.page || 0;
        AdsListView.__super__.itemListId = "#ads-list";

        //this sets the category in the Category Helper
        if (options.cat_id)
          CategoryHelper.setCategory(parseInt(options.cat_id,10));

        var ops = {location: "www.olx.com", offset:AdsListView.__super__.offset, pageSize: Const.get(this.className).pageSize};
        delete this.params["q"];

        ops = JSONHelper.concatJSON(ops, this.params);
        
        if(this.query){
          ops = JSONHelper.concatJSON(ops, {"searchTerm":this.query});
        }

        if(CategoryHelper.getCategory() != 0){
          ops = JSONHelper.concatJSON(ops, {"categoryId":CategoryHelper.getCategory()});
        }
        
        delete this.params["sort"];

        var Opts = Backbone.Model.extend();
        AdsListView.__super__.query_options = new Opts(ops);
        this.query_options = AdsListView.__super__.query_options;
        //this was meant for updating items when filters or sorts change.
        //Now it does not work. Rethink
        //this.query_options.on('change', this.updateItems, this);

        AdsListView.__super__.collection = new ItemsCollection({"item_type":"adsList"});
        this.items = AdsListView.__super__.collection;
        this.items.on('sync',_.bind(this.items_success, this));
        this.items.fetch({data: $.param(this.query_options.toJSON())});

        //Debug Code
        /*
        var collection = Backbone.Collection.extend();
        this.items = new collection([ {"id":"484949563", "location":"Paris",      "displayPrice":"$125.99", "title":"Chihuahua Puppies For Sale","thumbImage":"http://petliferadio.com/doggydog.jpg"},
                                      {"id":"484949178", "location":"Paris",      "displayPrice":"$200.00", "title":"Gun Dog Stud Many Willowyck & Drakeshead Lns","thumbImage":"http://www.cck9.com/wp-content/uploads/2009/09/German-shepherd-protection-dogs-CCK9-Blog-300x300.jpg"},
                                      {"id":"484940969", "location":"Marseille",  "displayPrice":"$549.99", "title":"Siberian Husky Female Puppy For Sale","thumbImage":"http://static.ddmcdn.com/gif/bad-dog-training-behavior-300.jpg"},
                                      {"id":"484940652", "location":"Lyon",       "displayPrice":"$110.00", "title":"Black And Yellow Labrador Puppies","thumbImage":"http://assets.archivhadas.es/system/tog_forum/topics/images/5395/big_perro-dog-cl.jpg"},
                                      {"id":"484939846", "location":"Nantes",     "displayPrice":"$80.55",  "title":"11 Week Old Kc Reg Lab Dog For Sale","thumbImage":"http://dogwalking.dogster.com/wp-content/themes/alcottTheme/uploads/Dog-Park-Safety.jpg"},
                                      {"id":"484937518", "location":"Lyon",       "displayPrice":"$166.80", "title":"Stunning Litter Of K.c","thumbImage":"http://img.ehowcdn.com/article-new/ehow/images/a04/qu/7b/signs-symptoms-dog-food-poisoning-800x800.jpg"},
                                      {"id":"484936416", "location":"Marseille",  "displayPrice":"$210.00", "title":"Barney At Wolfabulls Bulldogs","thumbImage":"http://www.theworld.org/wp-content/uploads/Q-dog-300x300.jpg"},
                                    ]);

        */
        //END Debug Code

        this.filters = new FiltersCollection();
        this.filters.on('sync',_.bind(this.filters_success, this));
        this.filters.fetch();

        this.sorts = new SortsCollection([
          {name: "price", order:"asc", description: "Price Ascending"},
          {name: "price", order:"desc", description: "Price Descending"},
          {name: "date", order:"asc", description: "Date Ascending"},
          {name: "date", order:"desc", description: "Date Descending"}
        ]);
        this.sorts_success();
        //this.sorts.on('sync',_.bind(this.sorts_success, this));
        //this.sorts.fetch();

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
        this.scrollingID = this.cid;
        AdsListView.__super__.bindScrolling.call(this);

      },

      render:function () {
        $(this.el).find('#content').html(this.adsCT({'search-term': this.query,
          'added-filters':JSONHelper.parseTitleValue(this.params),
          'sorts':this.sorts.toJSON(),
          'filters': this.filters.toJSON()
        }));

        $(this.el).find('#ads-list').html(this.adsListCT({'items': this.items.toJSON()}));

        if (CategoryHelper.categories.length > 0) {
          var breadOpts = {};
          var pCat;
          var catId = parseInt(this.options.cat_id,10);

          if (CategoryHelper.isParent(catId)) {
            pCat = CategoryHelper.categories.get(catId);
          }else{
            var sCat = CategoryHelper.getChild(catId);
            pCat = CategoryHelper.categories.get(sCat.get('parentId'));
            breadOpts = JSONHelper.concatJSON(breadOpts, {'sCat':sCat.get('id'),'sCatName':sCat.get('name')});
          };

          breadOpts = JSONHelper.concatJSON(breadOpts, {'pCat':pCat.get('id'),'pCatName':pCat.get('name')});

          $(this.el).find('#breadcrumb').show();
          $(this.el).find('#breadcrumb').html(this.breadCT(breadOpts));
        }

        $('#filterPopUp', this.el).html(this.filCT({'filters': this.filters.toJSON()}));
        $('#sortPopUp', this.el).html(this.sorCT({'sorts': this.sorts.toJSON()}));

        // Set the faux select control to display the first value
        $('.olx-ui-select select', this.el).each(function(){
          $(this).prev('span').attr('data-value', $(this).children('option:selected').text());
        });

        // Update faux select control on change to display the current value
        $('.olx-ui-select select', this.el).change(function(){
          $(this).prev('span').attr('data-value', $(this).children('option:selected').text());
        });

        this.bindFilters();
        this.bindSorts();

        return this;
      },

      bindFilters: function(){
        $('.filter').click({opts: this.query_options},function(ev){
          var filter = $(ev.currentTarget).data('filtername');
          var value = $(ev.currentTarget).val();
          
          if ($(ev.currentTarget).attr('type') != "checkbox") {
              ev.data.opts.set(filter,value);
          }else if ($(ev.currentTarget).is(":checked")) {
              ev.data.opts.set(filter,value);
          }else{
              ev.data.opts.unset(filter);
          }
          
        });

        $('.filter').keyup({opts: this.query_options},function(ev){
          var filter = $(ev.currentTarget).data('filtername');
          var value = $(ev.currentTarget).val();
          
          ev.data.opts.set(filter,value);
        });

        $('.filter').change({opts: this.query_options},function(ev){
          var filter = $(ev.currentTarget).data('filtername');
          var value = $(ev.currentTarget).val();
          
          ev.data.opts.set(filter,value);
        });

        $('.remove-filter').click({opts: this.query_options},_.bind(function(ev){
          var filter = $(ev.currentTarget).data('filtername');
          ev.data.opts.unset(filter);
          this.updateItems();
        },this));
      },

      bindSorts: function(){
        $('.sort').click({opts: this.query_options},function(ev){
          var sort = $(ev.currentTarget).data('sortname');
          var order = $(ev.currentTarget).data('sortorder');

          var prevSorts = _.filter(ev.data.opts.keys(),function(el){return el.indexOf("s") == 0});
          var existingSort = _.filter(ev.data.opts.keys(),function(el){return el.indexOf(sort) !== -1});
          var existingSortNum = (existingSort.length > 0)? existingSort[0].substring(1,2):0;

          var sNum = existingSortNum || prevSorts.length+1;

          ev.data.opts.set("s"+sNum+"."+sort,order);
        });
      },

      items_success: function(model, response)  {
        if (this.dfd) this.dfd.resolve(this);
        if (this.query) {
          //if this requests comes from a search, trigger the done event
          this.eventAggregator.trigger("searchDone");
        }
        return;
      },

      updateItems: function(){
        var url;

        if (!this.query_options.get("q")) {
          url = "#category/"+CategoryHelper.getCategory()+"?";
        }else{
          url = "#search?";
        };

        for (var key in this.query_options.attributes) {
          if (this.query_options.attributes[key] && key != "categoryId"
            && key != "country_id" && key != "pageSize" && key != "offset" && 
            key != "location")
            url += key + "=" + this.query_options.attributes[key] + "&";
        };

        url = url.substring(0,url.length-1);
        window.location = url;
      },

      filters_success: function(model, response){    
        //fill out the filter popup according to the filters already set in params
        this.filters.each(_.bind(function(filter) {
          var value = this.params[filter.get("name")];

          if (value) {
            var label = "";

            filter.set("checked", value);
            filter.set("value", value);

            if (filter.get("type") == "number") {
              label = value;
            }else{
              if (filter.get("values") && filter.get("values").length > 0) {
                var vals = filter.get("values");
                label = _.filter(vals,function(el){return el.id == value})[0].value;
                filter.set("checked", value);
              }
            }

            label = (label == "")?"":": "+label;
            filter.set("label", label);
          }
        }, this));

        this.render();
      },

      sorts_success: function(model, response){
        this.sorts.each(_.bind(function(sort) {
          var value = this.params["s."+sort.get("name")] || 
            this.params["s1."+sort.get("name")] || 
            this.params["s2."+sort.get("name")];

          if (value) {
            sort.set("checked", value);
            sort.set("value", value);
          }
        }, this));

        this.render();
      },

      togglePopUp: function(e){
        e.preventDefault();
        $(e.target.hash).toggleClass('visible');
      },

    });
    return AdsListView;
});
