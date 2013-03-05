// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/home/HomeView',
  'views/item/ItemView',
  'views/ads/AdsListView',
  'views/login/LoginView',
], function($, _, Backbone, HomeView, ItemView, AdsListView, LoginView) {
  
  var AppRouter = Backbone.Router.extend({
    routes:{
        "":"showHome",
        "item/:itemId": "showItem",
        "category/:catId": "showAds",
        "search?q=:query": "showSearchAds",
        "login": "showLogin",
        "*path":  "defaultRoute"
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
        
        var dfd = $.Deferred().done(this.changePage);

        new HomeView({'deferred': dfd});
    },

    defaultRoute: function(path) {
        window.location = "#";
    },

    showItem: function(itemId){
      console.log('/item/'+itemId);

      var dfd = $.Deferred().done(this.changePage);

      new ItemView({'deferred': dfd, 'id': itemId});
    },

    showLogin: function(itemId){
      console.log('/login');

      var dfd = $.Deferred().done(this.changePage);

      new LoginView({'deferred': dfd});
    },

    showAds: function(catId){
      console.log('/category/'+catId);

      var dfd = $.Deferred().done(this.changePage);

      new AdsListView({'deferred': dfd, 'cat_id': catId});
    },

    showSearchAds: function(query){
      console.log('/search/'+query);

      var dfd = $.Deferred().done(this.changePage);

      new AdsListView({'deferred': dfd, 'q': query});
    },

    changePage:function (page) {
      if (window.prevPage) {
        //unbinds the events binded to the previous page
        window.prevPage.undelegateEvents();
        window.prevPage.close();
      };

      window.prevPage = page;

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
