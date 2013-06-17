define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'collections/items',
  'collections/filters',
  'collections/sorts',
  'text!templates/ads/myAdsTemplate.html',
  'text!templates/ads/myAdsListTemplate.html',
  'views/scroll/ScrollView'
  ], 

  function($,_, Backbone, Handlebars, ItemsCollection, FiltersCollection, 
    SortsCollection, MyAdsTemplate,myAdsListTemplate, ScrollView){

    var MyAdsListView = ScrollView.extend({
      el: "#home",

      events: {
      },

      initialize: function(options){
        
        /*Compile the template using Handlebars micro-templating*/
        this.adsCT = Handlebars.compile(MyAdsTemplate);
        this.adsListCT = MyAdsListView.__super__.listTemplate  = Handlebars.compile(myAdsListTemplate);

        this.dfd = null || options.deferred;
        this.page= options.page || 0;
        this.pageSize =  10;
        this.user_id = this.Storage.get("userObj").userId;
        this.token = this.Storage.get("userObj").authToken;

        MyAdsListView.__super__.offset= options.page || 0;
        
        this.query_ops = {"country_id": 1, "offset":this.page, "pageSize": this.pageSize, "token": this.token, "userId":this.user_id};
        this.items = new ItemsCollection(this.query_ops, {"user_id":this.user_id}, {"item_type":"myAds"});
        MyAdsListView.__super__.collection = this.items;
        this.items.on('sync',_.bind(this.items_success, this));
        this.items.fetch();

        //Debug Code
        /*
        var collection = Backbone.Collection.extend();
        this.items = new collection([ {"id":"484949563", "adStatus":"rejected", "location":"Paris",      "displayPrice":"$125.99", "title":"Chihuahua Puppies For Sale","thumbImage":"http://petliferadio.com/doggydog.jpg"},
                                      {"id":"484949178", "adStatus":"active",   "location":"Paris",      "displayPrice":"$200.00", "title":"Gun Dog Stud Many Willowyck & Drakeshead Lns","thumbImage":"http://www.cck9.com/wp-content/uploads/2009/09/German-shepherd-protection-dogs-CCK9-Blog-300x300.jpg"},
                                      {"id":"484940969", "adStatus":"active",   "location":"Marseille",  "displayPrice":"$549.99", "title":"Siberian Husky Female Puppy For Sale","thumbImage":"http://static.ddmcdn.com/gif/bad-dog-training-behavior-300.jpg"},
                                      {"id":"484940652", "adStatus":"pending",  "location":"Lyon",       "displayPrice":"$110.00", "title":"Black And Yellow Labrador Puppies","thumbImage":"http://assets.archivhadas.es/system/tog_forum/topics/images/5395/big_perro-dog-cl.jpg"},
                                      {"id":"484939846", "adStatus":"rejected", "location":"Nantes",     "displayPrice":"$80.55",  "title":"11 Week Old Kc Reg Lab Dog For Sale","thumbImage":"http://dogwalking.dogster.com/wp-content/themes/alcottTheme/uploads/Dog-Park-Safety.jpg"},
                                      {"id":"484937518", "adStatus":"close",    "location":"Lyon",       "displayPrice":"$166.80", "title":"Stunning Litter Of K.c","thumbImage":"http://img.ehowcdn.com/article-new/ehow/images/a04/qu/7b/signs-symptoms-dog-food-poisoning-800x800.jpg"},
                                      {"id":"484936416", "adStatus":"active",   "location":"Marseille",  "displayPrice":"$210.00", "title":"Barney At Wolfabulls Bulldogs","thumbImage":"http://www.theworld.org/wp-content/uploads/Q-dog-300x300.jpg"},
                                    ]);
        */
        //END Debug Code


        this.templateKey = "items";
        this.scrollingID = "myAds"+this.user_id;
        MyAdsListView.__super__.bindScrolling.call(this);
      },

      render:function () {
        $(this.el).find('#content').html(this.adsCT());
        $(this.el).find('#ads-list').html(this.adsListCT({'items': this.items.toJSON()}));
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
