define([
  'jquery',
  'underscore',
  'backbone',
  'swipe',
  'handlebars',
  'collections/items',
  'text!templates/home/homeTemplate.html',
  'text!templates/home/whatsNewTemplate.html',
  'text!templates/home/lastVisitTemplate.html',
  'helpers/ScreenHelper',
  'helpers/CategoryHelper'
  ], 

  function($,_, Backbone, sw, Handlebars, ItemsCollection, 
    homeTemplate, whatsNewTemplate, lastVisitTemplate, ScreenHelper, CategoryHelper){

    var HomeView = Backbone.View.extend({
      el: "#home",

      fetchsAmount: 0,

      fetchsTotals: 2,

      events:{
      },

      initialize: function(options){
        document.title = "OLX Mobile";

        CategoryHelper.setCategory(0);
        
        this.dfd = null || options.deferred;

        // Compile the template using Handlebars micro-templating
        this.homeCT = Handlebars.compile(homeTemplate);
        this.whatsNewCT = Handlebars.compile(whatsNewTemplate);
        this.lastVisitCT = Handlebars.compile(lastVisitTemplate);

        this.whatsNewItems = new ItemsCollection({countryId:1, filters:"[{'name':'withPhotos', 'value':'true'}]"},{},{"item_type":"adsList"});
        this.whatsNewItems.on('sync',_.bind(this.items_success, this));
        this.whatsNewItems.fetch();

        this.lastVisitedItems = new ItemsCollection({countryId:1},{},{"item_type":"adsList"});
        this.lastVisitedItems.on('sync',_.bind(this.items_success, this));
        this.lastVisitedItems.fetch();
        
        //Debug Code
        /*
        var collection = Backbone.Collection.extend();
        this.whatsNewItems = new collection([ {"id":"484949563", "title":"Chihuahua Puppies For Sale","thumbImage":"http://petliferadio.com/doggydog.jpg"},
                                              {"id":"484949178", "title":"Gun Dog Stud Many Willowyck & Drakeshead Lns","thumbImage":"http://www.cck9.com/wp-content/uploads/2009/09/German-shepherd-protection-dogs-CCK9-Blog-300x300.jpg"},
                                              {"id":"484940969", "title":"Siberian Husky Female Puppy For Sale","thumbImage":"http://static.ddmcdn.com/gif/bad-dog-training-behavior-300.jpg"},
                                              {"id":"484940652", "title":"Black And Yellow Labrador Puppies","thumbImage":"http://assets.archivhadas.es/system/tog_forum/topics/images/5395/big_perro-dog-cl.jpg"},
                                              {"id":"484939846", "title":"11 Week Old Kc Reg Lab Dog For Sale","thumbImage":"http://dogwalking.dogster.com/wp-content/themes/alcottTheme/uploads/Dog-Park-Safety.jpg"},
                                              {"id":"484937518", "title":"Stunning Litter Of K.c","thumbImage":"http://img.ehowcdn.com/article-new/ehow/images/a04/qu/7b/signs-symptoms-dog-food-poisoning-800x800.jpg"},
                                              {"id":"484936416", "title":"Barney At Wolfabulls Bulldogs","thumbImage":"http://www.theworld.org/wp-content/uploads/Q-dog-300x300.jpg"},
                                                  ]);
        
        this.lastVisitedItems = this.whatsNewItems;
        this.items_success();
        */
        //END Debug Code
        
      },

      render:function (){
        
        $(this.el).find('#content').html(this.homeCT({}));
        //$(this.el).trigger('create');

        $(this.el).find('#slider1').html(this.whatsNewCT({'items': this.whatsNewItems.toJSON()}));
        this.slider1 = new Swipe(document.getElementById('slider1'), {
                            //startSlide: 2,
                            //speed: 400,
                            //auto: 3000,
                            'items':ScreenHelper.getImgsNum(),
                            'callback': function(event, index, elem) {
                            }
        });

        $(this.el).find('#slider2').html(this.lastVisitCT({'items': this.lastVisitedItems.toJSON()}));
        this.slider2 = new Swipe(document.getElementById('slider2'), {
                            //startSlide: 2,
                            //speed: 400,
                            //auto: 3000,
                            'items':ScreenHelper.getImgsNum(),
                            'callback': function(event, index, elem) {
                            }
        });

        $(window).resize(_.bind(function() {
          this.slider1.items = ScreenHelper.getImgsNum();
          this.slider2.items = ScreenHelper.getImgsNum();
        },this));
        

        return this;
      },

      items_success: function(model, response){
        this.fetchsAmount +=1;
        if(this.fetchsAmount == this.fetchsTotals){
          if (this.dfd) 
            this.dfd.resolve(this);
        }
      }
    });
    return HomeView;
});
