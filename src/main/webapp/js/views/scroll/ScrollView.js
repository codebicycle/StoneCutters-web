define([
  'jquery',
  'underscore',
  'backbone',
  'constants/const',
  ], 
  
  // How to use this view:
  // ---------------------
  // You must extend this view if only you want the infinit scroll for a specified view.
  // In order to set up your scrolling view you have to define/override the following variables:
  //
  // scrollingID: must be unique for each view.
  // collection: the collection that we are scrolling and fetching more elements.
  // listTemplate: the template that is in charge of rendering the items.
  //
  // Inside your initialize function you have to call the following method, where MyView is 
  // the name of the new view.
  // MyView.__super__.bindScrolling.call(this);
  //
  // Note: this view assumes that inside our collection you have an query_opts element which has offset variable inside.
  // this.collection.query_opts.offset

  function($,_, Backbone, Const){

    var ScrollView = Backbone.View.extend({

      scrollingID: "overrideThis",

      offset:0,
      
      bindScrolling:function(){
        //We are not able to attach this event in events: {}, because windows is not inside el.
        //Namespaced events. http://docs.jquery.com/Namespaced_Events (This is here to avoid a bug)
        $(window).bind("scroll."+this.scrollingID, (_.bind(this.checkScroll,this)));
      },

      checkScroll: function () {
        var triggerPoint = Const.get("ScrollView").scrollFetchPxOffset; // 100px from the bottom
        
        if( !this.isLoading && $(window).scrollTop() + $(window).height() + triggerPoint > $(document).height()) {
          this.query_options.set("offset", this.query_options.get("offset") + 1); // Load next page
          this.loadResults();
        }
      },

      loadResults: function () {
        this.collection.on('sync',_.bind(this.load_more_items, this));
        this.isLoading = true;
        this.collection.fetch({data: $.param(this.query_options.toJSON())});
      },

      load_more_items:function(items){
        if (this.collection.length < this.query_options.get("pageSize")) {
          //if there are less items than the items I requested, unbind infinite scrolling
          this.close();
          return;
        }

        var data= {};
        data[this.templateKey] = this.collection.toJSON();
        $(this.el).find(this.itemListId).append(this.listTemplate(data));
        this.isLoading = false;
        return this;
      },

      close: function(){
        $(window).unbind("scroll."+this.scrollingID);
      }
    });
    return ScrollView;
});