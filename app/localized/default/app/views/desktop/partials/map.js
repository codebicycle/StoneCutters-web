var Base = require('../../../../../common/app/bases/view');

module.exports = Base.extend({
    className: 'partials_map_view',
    postRender: function() {
        
        $('#map a').hover(function() {
			var state = $(this).attr('data-state');
        	$('#mapTooltip strong.state').text(state);
            $('#mapTooltip').show();
            $('#map a').on('mousemove', function( event ) {
				$('#mapTooltip').css('left', event.pageX + 'px' );
				$('#mapTooltip').css('top', event.pageY + 'px' );
            });
        }, function() {

            $('#mapTooltip').hide();
        });
    }

});

module.exports.id = 'partials/map';