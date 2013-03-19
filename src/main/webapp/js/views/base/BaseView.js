define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'collections/categories',
  'models/user',
  'text!templates/base/leftPanelTemplate.html'
  ], 

  function($,_, Backbone, Handlebars, CategoriesCollection, UserModel, 
    leftPanelTemplate){

    var BaseView = Backbone.View.extend({
      el: "#home",

      events:{
        'click .cat-link': "refreshList",
        'click #p-cat-link': "showParentCategories",
        'click #toggle-search': "toggleSearch",
        'click #myolx-link' : "toggleMyOLXCats",
        'click #logout-link' : "logout"
      },

      initialize: function(options){

        this.dfd = null || options.deferred;

        // Compile the template using Handlebars micro-templating
        this.panelCT = Handlebars.compile(leftPanelTemplate);

        this.loadCategories = new CategoriesCollection();

        this.categories = new CategoriesCollection();
        //this.categories.comparator = 'name';
        //underscore bind preserves the views scope so that this.categories is still 
        //defined in the success callback
        this.categories.on('sync',_.bind(this.cat_success, this));
        this.categories.fetch();

        this.eventAggregator.on("searchDone", _.bind(this.doneSearch,this));
        this.eventAggregator.on("loggedIn", _.bind(this.render,this));

        $.extend($.event.special.swipe,{
          scrollSupressionThreshold: 10, // More than this horizontal displacement, and we will suppress scrolling.
          durationThreshold: 1000, // More time than this, and it isn't a swipe.
          horizontalDistanceThreshold: Math.min($(document).width() / 2, 160),  // Swipe horizontal displacement must be more than this.
          verticalDistanceThreshold: 75,  // Swipe vertical displacement must be less than this.
        });

        $( document ).on( "swipeleft swiperight", this.el, function( e ) {
            if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
                // if ( e.type === "swipeleft"  ) {
                //     $( "#right-panel" ).panel( "open" );
                // } else if ( e.type === "swiperight" ) {
                //     $( "#left-panel" ).panel( "open" );
                // }
                if ( e.type === "swiperight" ) {
                    $( "#left-panel" ).panel( "open" );
                }
            }
        });

        $('#search-bar').change(function(){
          window.location = "#search?q=" + $('#search-bar').val();
        });
      },
      render:function (){
        $(this.el).find('#left-panel').html(this.panelCT({
          'user': (this.Storage.get("userObj"))? this.Storage.get("userObj") : null, 
          'categories': this.loadCategories.toJSON()})
        );
        $(this.el).find('#left-panel').trigger("updatelayout");
        
        $(this.el).find('#left-panel-list').listview();
        $(this.el).find('#p-cat-link').hide();
        $(this.el).find('.myolx-cat').hide();

        return this;
      },
      cat_success: function(model, response){
        this.loadCategories.reset(response);
        if (this.dfd) this.dfd.resolve(this);
      },
      refreshList: function(ev){
        var data_id = $(ev.currentTarget).data("id");
        var parent_id = $(ev.currentTarget).data("parentId");
        var category = null;

        if (parent_id) {
          var parentCategory = this.categories.get(parent_id);
          var children = new CategoriesCollection(parentCategory.get('children'));
          category = children.get(data_id);
        }else{
          category = this.categories.get(data_id);
          $('li#cat-divider.ui-li').text(category.get('name'));
        }

        document.title = category.get('name');

        if (category.get('children').length > 0) {
          this.changeCategories(category.get('children'));
        }

        if (!parent_id) {
          $('li#cat-divider.ui-li').text(category.get('name'));
          $(this.el).find('#p-cat-link').show();
        }

        //deselects the currently selected sub-category
        $('.ui-li').removeClass('ui-focus');
      },
      showParentCategories: function(){
        this.changeCategories(this.categories.toJSON());
      },
      toggleSearch: function(){
        $("#search-bar-div").toggle();

        if ($("#search-bar-div").is(":visible")){
          $('#search-bar').focus();
          //$('#toggle-search .ui-btn-text').text('Cancel');
        }else{
          $('#search-bar').val("");
          //$('#toggle-search .ui-btn-text').text('Search');
        }
      },
      toggleMyOLXCats: function(){
        $(this.el).find('.myolx-cat').slideToggle('fast');
      },
      doneSearch: function(){
        $("#search-bar-div").hide();
        $('#search-bar').val("");
        $('#toggle-search .ui-btn-text').text('Search');
      },
      changeCategories: function(categories){
        this.loadCategories.reset(categories);
        this.render();
      },
      logout: function(){
        this.Storage.clear();
        this.render();
      },
    });
    return BaseView;
});