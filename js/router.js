// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/home/HomeView',
  'views/pages/Page1View',
  'views/pages/Page2View'
//  'views/footer/FooterView',
//  'views/header/headerView'
], function($, _, Backbone, HomeView, Page1View, Page2View) {
  
  var AppRouter = Backbone.Router.extend({
    routes:{
        "":"home",
        "page1":"page1",
        "page2":"page2"
    },

    initialize:function () {
        // Handle back button throughout the application
        $('.back').live('click', function(event) {
            window.history.back();
            return false;
        });
        this.firstPage = true;
    },

    home:function () {
        console.log('#home');
        this.changePage(new HomeView());
    },

    page1:function () {
        console.log('#page1');
        this.changePage(new Page1View());
    },

    page2:function () {
        console.log('#page2');
        this.changePage(new Page2View());
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
