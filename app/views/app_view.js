var BaseAppView = require('rendr/client/app_view');

var $body = $('body');

module.exports = BaseAppView.extend({
	className: 'app_view_index_view',

	events:{
	   'click #toggle-panel': 'toggleLeftPanel',
	   'click #toggle-search': 'toggleSearch',
    },

  	postInitialize: function() {
    	this.app.on('change:loading', function(app, loading) {
    	  $body.toggleClass('loading', loading);
    	}, this);

    	jQuery('#search-bar').change(function(){
          window.location = "search?location="+"www.olx.com.ar"+"&q=" + jQuery('#search-bar').val();
        });
  	},

  	toggleLeftPanel: function(e){
        if(e)
            e.preventDefault();
        
        $('body').toggleClass('left-panel-visible');
    },

    toggleSearch: function(e){
	    if (e) {
	    	e.preventDefault();
	    }

	    $("#search-container").toggle();

	    if ($("#search-container").is(":visible")){
	      $('#search-bar').focus();
	      //$('#toggle-search .ui-btn-text').text('Cancel');
	    }else{
	      $('#search-bar').val("");
	      //$('#toggle-search .ui-btn-text').text('Search');
	    }
	},
});

module.exports.id = 'app_view/index';
