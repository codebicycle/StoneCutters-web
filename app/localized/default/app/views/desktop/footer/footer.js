'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('footer/footer');

module.exports = Base.extend({
    tagName: 'footer',
    id: 'footer',
    className: 'footer_view',
    events: {
        'click ul li a:not([href])': 'toggleTeaser',
        'click .teaser header a': 'closeTeaser'
    },
    toggleTeaser: function(e) {
        var $teaser = $('.teaser', this.$el);
        $teaser.toggleClass('open');
    },
    closeTeaser: function(e) {
        var $teaser = $('.teaser', this.$el);
        $teaser.removeClass('open');
    }

});
