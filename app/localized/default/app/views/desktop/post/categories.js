var Base = require('../../../../../common/app/bases/view').requireView('post/categories');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'post_categories_view',
    postRender: function() {
        $('.category').hover(function() {
            $('.catContent').removeClass('visible');
            var currentCat = $(this).attr('id');
            $('.' + currentCat).addClass('visible');

            var currentSubCat = $('.' + currentCat).offset().top + $('.' + currentCat).height();
            var container = $('#categories').offset().top + $('#categories').height();

            if(currentSubCat > container && !$('.' + currentCat).hasClass('reposition')){
                var newTop = currentSubCat - container;
                $('.' + currentCat).addClass('reposition');
                $('.' + currentCat).css({ top : '-' + newTop + 'px' });
            }
        });
        $('html').click(function() {
            $('.catContent').removeClass('visible');
        });
        $('.category').click(function(event){
            event.stopPropagation();
        });
    }

});
