var BaseAppView = require('rendr/client/app_view');

var $body = $('body');

module.exports = BaseAppView.extend({
	className: 'app_view_index_view',
	
	events:{
	   'click #toggle-panel': 'toggleLeftPanel',
    },

  	postInitialize: function() {
    	this.app.on('change:loading', function(app, loading) {
    	  $body.toggleClass('loading', loading);
    	}, this);
  	},

  	toggleLeftPanel: function(e){
        if(e)
            e.preventDefault();
        
        $('body').toggleClass('left-panel-visible');
    },
});

module.exports.id = 'app_view/index';
