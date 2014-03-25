'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');

if (typeof window != 'undefined') {
    var Swipe = require('../../lib/swiper');
}

module.exports = BaseView.extend({
    className: 'home_index_view',
    processItem: function(item) {
        var year = item.date.year;
        var month = item.date.month - 1;
        var day = item.date.day;
        var hour = item.date.hour;
        var minute = item.date.minute;
        var second = item.date.second;
        var date = new Date(year, month, day, hour, minute, second);

        item.date.since = helpers.timeAgo(date);
    },
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        _.each(data.whatsNewItems, this.processItem);
        return _.extend({}, data, {
            user: this.app.getSession('user'),
            location: this.app.getSession('location'),
            template: this.app.getSession('template'),
            languages: this.app.getSession('languages'),
            selectedLanguage: this.app.getSession('selectedLanguage')
        });
    },
    postRender: function(){
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
