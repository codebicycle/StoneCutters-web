define([
  'jquery',
  'underscore',
  'backbone',
  'swipe',
  'handlebars',
  'collections/items',
  'text!templates/home/homeTemplate.html',
  'text!templates/home/sliderTemplate.html'
  ], 

  function($,_, Backbone, sw, Handlebars, ItemsCollection, 
    homeTemplate, sliderTemplate){

    var HomeView = Backbone.View.extend({
      el: "#home",

      events:{
      },

      initialize: function(options){
        document.title = "OLX Mobile";
        
        this.dfd = null || options.deferred;

        // Compile the template using Handlebars micro-templating
        this.homeCT = Handlebars.compile(homeTemplate);
        this.sliderCT = Handlebars.compile(sliderTemplate);

        this.items = new ItemsCollection({country_id:1},{},{"item_type":"adsList"});
        this.items.on('sync',_.bind(this.items_success, this));
        this.items.fetch();

      },
      render:function (){
        
        $(this.el).find('#content').html(this.homeCT({}));
        //This line is commented in order to get green in the sliding test.
        //$(this.el).trigger('create');

        $(this.el).find('#slider1').html(this.sliderCT({'items': this.items.toJSON()}));
        this.slider1 = new Swipe(document.getElementById('slider1'), {
                            //startSlide: 2,
                            //speed: 400,
                            //auto: 3000,
                            'items':3,
                            'callback': function(event, index, elem) {
                            }
        });

        return this;
      },
      items_success: function(model, response){
        if (this.dfd) this.dfd.resolve(this);
      },
    });
    return HomeView;
});
