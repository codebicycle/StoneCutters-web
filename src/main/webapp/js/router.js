// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/home/HomeView',
  'views/item/ItemView',
  'views/ads/AdsListView',
  'views/login/LoginView',
  'views/register/RegisterView',
  'views/register/TermsView',
  'views/messages/MyMessagesListView',
  'views/ads/MyAdsListView',
  'views/ads/MyFavoriteAdsView',
  'views/posting/PostingView',
], function($, _, Backbone, HomeView, ItemView, AdsListView, LoginView, 
  RegisterView, TermsView, MyMessagesListView, MyAdsListView, MyFavoritesView, PostingView) {
  
  var AppRouter = Backbone.Router.extend({
    routes:{
        "":"showHome",
        "item/:itemId": "showItem",
        "category/:catId(/:params)": "showAds",
        "search?:params": "showSearchAds",
        "login": "showLogin",
        "register": "showRegister",
        "post": "showPosting",
        "terms": "showTerms",
        "mymessages": "showMyMessages",
        "myads": "showMyAds",
        "myfavs": "showMyFavorites",
        "*path":  "defaultRoute"
    },

    initialize:function () {
        // Handle back button throughout the application
        $('body').on('click', '.back', function(event) {
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

    showItem: function(itemId){
      console.log('/item/'+itemId);

      var dfd = $.Deferred().done(this.changePage);

      new ItemView({'deferred': dfd, 'id': itemId});
    },

    showAds: function(catId,params){
      if (params) {
        console.log('/category/'+catId+"/"+params);
      }else{
        console.log('/category/'+catId);
      };

      var dfd = $.Deferred().done(this.changePage);

      new AdsListView({'deferred': dfd, 'cat_id': catId, 'params': params});
    },

    showSearchAds: function(params){
      console.log('/search?'+params);

      var dfd = $.Deferred().done(this.changePage);

      new AdsListView({'deferred': dfd, 'params': params});
    },

    showLogin: function(){
      console.log('/login');

      var dfd = $.Deferred().done(this.changePage);

      new LoginView({'deferred': dfd});
    },

    showRegister: function(){
      console.log('/register');

      var dfd = $.Deferred().done(this.changePage);

      new RegisterView({'deferred': dfd});
    },

    showPosting: function(){
      console.log('/post');

      var dfd = $.Deferred().done(this.changePage);

      new PostingView({'deferred': dfd});
    },

    showTerms: function(){
      console.log('/terms');

      var dfd = $.Deferred().done(this.changePage);

      new TermsView({'deferred': dfd});
    },

    showMyMessages: function(){
      console.log('/mymessages');

      var dfd = $.Deferred().done(this.changePage);

      new MyMessagesListView({'deferred': dfd});
    },

    showMyAds: function(){
      console.log('/myads');

      var dfd = $.Deferred().done(this.changePage);

      new MyAdsListView({'deferred': dfd});
    },

    showMyFavorites: function(){
      console.log('/myfavorites');

      var dfd = $.Deferred().done(this.changePage);

      new MyFavoritesView({'deferred': dfd});
    },
    
    defaultRoute: function(path) {
        window.location = "#";
    },

    changePage:function (page) {
      if (window.prevPage) {
        //unbinds the events binded to the previous page
        window.prevPage.undelegateEvents();
        window.prevPage.close();
      };

      window.prevPage = page;

      page.render();
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