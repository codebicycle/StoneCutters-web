var Base = require('../../../../../common/app/bases/view').requireView('footer/footer');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');
var asynquence = require('asynquence');

module.exports = Base.extend({
    className: 'footer_footer_view',
    
	postRender: function() {

		this.attachTrackMe(this.className, function(category, action) {
			return {
				custom: [category, '-', action].join('::')
			};
		});

	}
});