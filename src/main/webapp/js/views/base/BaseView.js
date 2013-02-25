define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'collections/categories',
  'text!templates/base/categoriesListTemplate.html'
  ], 

  function($,_, Backbone, Handlebars, CategoriesCollection, 
    categoriesListTemplate){

    var BaseView = Backbone.View.extend({
      el: "#home",

      events:{
        'click .cat-link': "refreshList",
        'click #p-cat-link': "showParentCategories",
        'click #toggle-search': "toggleSearch"
      },

      initialize: function(){
        
        // Compile the template using Handlebars micro-templating
        this.catCT = Handlebars.compile(categoriesListTemplate);

        this.categories = new CategoriesCollection();
        //this.categories.comparator = 'name';
        //underscore bind preserves the views scope so that this.categories is still 
        //defined in the success callback
        this.categories.on('sync',_.bind(this.cat_success, this));
        this.categories.fetch();

        this.eventAggregator.on("searchDone", _.bind(this.doneSearch,this));

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
        return this;
      },
      cat_success: function(model, response){
        $(this.el).find('#left-panel').html(this.catCT({'categories': response}));
        $(this.el).find('#left-panel').trigger("updatelayout");
        $(this.el).find('#categories-list').listview();
        $(this.el).find('#p-cat-link').button();
        $(this.el).find('#p-cat-link').hide();
      },
      refreshList: function(ev){
        var data_id = $(ev.currentTarget).data("id");
        var parent_id = $(ev.currentTarget).data("parentId");
        var category = null;

        if (parent_id) {
          var parentCategory = this.categories.get(parent_id);
          var children = new CategoriesCollection(parentCategory.get('children'));
          category = children.get(data_id);
          $(this.el).find('#left-panel').panel("close");
        }else{
          category = this.categories.get(data_id);
        }

        if (category.get('children').length > 0) {
          this.cat_success({}, category.get('children'));
        }

        if (!parent_id) {
          $(this.el).find('#p-cat-link').show();
        }

        //deselects the currently selected sub-category
        $('.ui-li').removeClass('ui-focus');
        
      },
      showParentCategories: function(){
        this.cat_success([],this.categories.toJSON());
        $("#p-cat-link").hide();
      },
      toggleSearch: function(){
        $("#search-bar-div").toggle();

        if ($("#search-bar-div").is(":visible")){
          $('#search-bar').focus();
          $('#toggle-search .ui-btn-text').text('Cancel');
        }else{
          $('#search-bar').val("");
          $('#toggle-search .ui-btn-text').text('Search');
        }
      },
      doneSearch: function(){
        this.toggleSearch();
      },
    });
    return BaseView;
});