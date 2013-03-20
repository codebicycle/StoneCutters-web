define([
  'jquery',
  'underscore',
  'backbone',
  ], 
  
  // How to use this view:
  // ---------------------
  // You must extend this view if only you want the infinit scroll for a specified view.
  // Inside your initialize function you have to call the following method, where MyView is 
  // the name of the new view.
  // Do not forget to override the scrollingID variable.
  // MyView.__super__.bindScrolling.call(this);

  function($,_, Backbone){

    var ScrollView = Backbone.View.extend({

      scrollingID: "overrideThis",

      offset:0,
      
      bindScrolling:function(){
        //We are not able to attach this event in events: {}, because windows is not inside el.
        //Namespaced events. http://docs.jquery.com/Namespaced_Events (This is here to avoid a bug)
        $(window).bind("scroll."+this.scrollingID, (_.bind(this.checkScroll,this)));
      },

      checkScroll: function () {
        var triggerPoint = 100; // 100px from the bottom
        if( !this.isLoading && $(window).scrollTop() + $(window).height() + triggerPoint > $(document).height()  ) {
          this.collection.query_opts.offset += 1; // Load next page
          this.loadResults();
        }
      },

      loadResults: function () {
        this.collection.on('sync',_.bind(this.load_more_items, this));
        this.isLoading = true;
        this.collection.fetch();
      },

      load_more_items:function(items){
        var data= {};
        data[this.templateKey] = this.collection.toJSON();
        $(this.el).find('#ads-list').append(this.moreTemplate(data));
        $(this.el).find('#ads-list').listview("refresh");
        this.isLoading = false;
        return this;
      },

      close: function(){
        $(window).unbind("scroll.myAds"+this.user_id);
      }
    });
    return ScrollView;
});