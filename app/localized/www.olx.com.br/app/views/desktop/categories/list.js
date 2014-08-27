var Base = require('../../../../../common/app/bases/view').requireView('categories/list');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'categories_list_view',
    postRender: function() {
        
        var that = this;

        var categories = this.$('.swiper-container').swiper({
            mode:'horizontal',
            slidesPerView: 3,
            loop: true,
            autoplay: 10000,
            onlyExternal: true
            });

        this.$('.slideBtn.next').click(function(e) {
            e.preventDefault();
            categories.swipeNext();
        });
        this.$('.slideBtn.prev').click(function(e) {
            e.preventDefault();
            categories.swipePrev();
        });

        $('.states a').hover(function() {
            var current = $(this).text().toLowerCase();
            $('a.' + current).attr('class', current + ' active');
        }, function() {
            var current = $(this).text().toLowerCase();
            $('a.' + current).attr('class', current);
        });
    }

});