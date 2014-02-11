var BaseAppView = require('rendr/client/app_view');

var $body = $('body');

module.exports = BaseAppView.extend({
	className: 'app_view_index_view',

	events:{
	   'click .navLeft': 'toggleLeftPanel',
	   'click #overlay': 'toggleLeftPanel',
	   'click #toggle-search': 'toggleSearch',
    },

  	postInitialize: function() {
    	this.app.on('change:loading', function(app, loading) {
    	  $body.toggleClass('loading', loading);
    	}, this);

    	var siteLoc = this.app.get("baseData").siteLocation;

    	jQuery('#search-bar').change(function(){
          window.location = "search?location="+siteLoc+"&q=" + jQuery('#search-bar').val();
        });


        $('nav div').css('height' , ($(window).height() - $('header').height())+'px');

		$( window ).resize(function() {
		  $('nav div').css('height' , ($(window).height() - $('header').height())+'px');
		});
  	},

  	toggleLeftPanel: function(e){
        e.preventDefault();
        $('article nav').toggleClass('open');
        $('#overlay').fadeToggle();
		$('body').toggleClass('noscroll');
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
