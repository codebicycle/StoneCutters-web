'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var fitText = require('../../helpers/fit_text_helper').fitText;
var timeAgo = require('../../helpers/time_ago_helper').timeAgo;

if (typeof window != 'undefined') {
    var Swipe = require('../../lib/swiper');
};

module.exports = BaseView.extend({
    className: 'home_index_view',
    processItem: function(item) {
        var dateAg = timeAgo(new Date(item.date.year, item.date.month - 1, item.date.day, item.date.hour, item.date.minute, item.date.second));
        item.date.since = dateAg;
    },
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);
        _.each(data.whatsNewItems, this.processItem);
        return _.extend({}, data, {
            count: this.app.get('session').count,
            user: this.app.get('session').user,
            location: this.app.get('baseData').location
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
        fitText($('section#newAds .swiper-containerAds .caption') , .9 , {
            minFontSize: '9px',
            maxFontSize: '30px'
        });
        fitText($('section#categories .swiper-containerCats .slide div p') , .7 , {
            minFontSize: '9px',
            maxFontSize: '30px'
        });
    }
});

module.exports.id = 'home/index';
