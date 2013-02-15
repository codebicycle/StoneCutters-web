// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/home/HomeView',
  'views/item/ItemView',
  'views/ads/AdsListView',
], function($, _, Backbone, HomeView, ItemView, AdsListView) {
  
  var AppRouter = Backbone.Router.extend({
    routes:{
        "":"showHome",
        "item/:itemId": "showItem",
        "category/:catId": "showAds",
    },

    initialize:function () {
        // Handle back button throughout the application
        $('.back').live('click', function(event) {
            window.history.back();
            return false;
        });
        this.firstPage = true;
    },

    showHome:function () {
        console.log('/');
        this.changePage(new HomeView());
    },

    showItem: function(itemId){
      console.log('/item/'+itemId);
      this.changePage(new ItemView({'id': itemId}));
    },

    showAds: function(catId){
      console.log('/category/'+catId);

      var dfd = $.Deferred().done(this.changePage);

      new AdsListView({'deferred': dfd, 'cat_id': catId});
    },

    changePage:function (page) {
      $(page.el).attr('data-role', 'page');
      page.render();
      $('body').append($(page.el));
      var transition = $.mobile.defaultPageTransition;
      
      // We don't want to slide the first page
      if (this.firstPage) {
          transition = 'none';
          this.firstPage = false;
      }
      $.mobile.changePage($(page.el), {changeHash:false, transition: transition});
    }
  });
  
  var initialize = function(){
    var app_router = new AppRouter();
    Backbone.history.start();
  };
  return { 
    initialize: initialize
  };
});
