'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('footer/footer');

module.exports = Base.extend({
    tagName: 'footer',
    id: 'footer',
    className: 'footer_view',
    events: {
        'click ul li span': 'handleLiClick',
        'click .teaser header span': 'handleSpanClick'
    },
    handleLiClick: function(event) {
        var current = $(event.currentTarget).attr('class');
        var $currentTeaser = this.$('.teaser#' + current);
        var $teasers = this.$('.teaser');

        if($teasers.hasClass('open') && !$currentTeaser.hasClass('open')) {
            $teasers.filter('.open').slideToggle('slow', function() {
                $teasers.filter('.open').toggleClass('open');
                $currentTeaser.slideToggle('slow', function() {
                    $currentTeaser.toggleClass('open');      
                });   
            });
        } else {
            $currentTeaser.slideToggle('slow', function() {
                $currentTeaser.toggleClass('open');      
            });
        }
    },
    handleSpanClick: function() {
        this.$('.teaser.open').slideToggle('slow');
    },
    postRender: function() {
        
    }
});