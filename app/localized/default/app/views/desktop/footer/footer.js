'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('footer/footer');

module.exports = Base.extend({
    tagName: 'footer',
    id: 'footer',
    className: 'footer_view',
    /*events: {
        'click ul li span': 'toggleTeaser',
        'click .teaser header a': 'closeTeaser'
    },
    toggleTeaser: function(e) {
        var $teaser = $('.teaser', this.$el);
        console.log(this);
        $teaser.slideToggle();
    },
    closeTeaser: function(e) {
        var $teaser = $('.teaser', this.$el);
        $teaser.slideToggle();
    }*/
    postRender: function() {
        $('#footer ul li span').click(function() {
            var current = $(this).attr('class');
            if($('#footer').find('.teaser').hasClass('open') && !$('.teaser#' + current).hasClass('open')) {
                $('.teaser.open').slideToggle( "slow", function() {
                    $('.teaser.open').toggleClass('open');
                    $('.teaser#' + current).slideToggle( "slow", function() {
                        $('.teaser#' + current).toggleClass('open');      
                    });   
                });
            } else {
                $('.teaser#' + current).slideToggle( "slow", function() {
                    $('.teaser#' + current).toggleClass('open');      
                });
            }
        });
        $('#footer .teaser header span').click(function() {
            $('.teaser.open').slideToggle('slow');
        });
    }

});
