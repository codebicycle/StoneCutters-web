'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');

module.exports = BaseView.extend({
    className: 'home_index_view',
    postRender: function() {
        var swiperAds = $('.swiper-containerAds').swiper({
            mode:'horizontal',
            slidesPerView: 3,
            preventLinks:false
        });
        var swiperCats = $('.swiper-containerCats').swiper({
            mode:'horizontal',
            slidesPerView: 4,
            preventLinks:false
        });
        $(window).on('resize', this.resize).trigger('resize');
    },
    remove: function() {
        $(window).off('resize', this.resize);
        BaseView.prototype.remove.apply(this, arguments);
    },
    resize: function() {
        helpers.fitText($('section#newAds .swiper-containerAds .caption') , 0.9 , {
            minFontSize: '9px',
            maxFontSize: '30px'
        });
        helpers.fitText($('section#categories .swiper-containerCats .slide div p') , 0.7 , {
            minFontSize: '9px',
            maxFontSize: '30px'
        });
    }
});

module.exports.id = 'home/index';
