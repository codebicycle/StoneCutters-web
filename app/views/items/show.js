'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'items_show_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);
        data.category_name = this.options.category_name;
        data.item.location.stateName = data.item.location.children[0].name;
        data.item.location.cityName = data.item.location.children[0].children[0].name;
        data.item.description = data.item.description.replace(/(<([^>]+)>)/ig,'');
        data.item.images.noImage = false;
        data.item.images.oneImage = false;
        if(data.item.images.length === 0){
            data.item.images.noImage = true; 
        }else if (data.item.images.length == 1){
            data.item.images.oneImage = true;
        }
        return data;
    },
    postRender: function() {
        var galery = $('.swiper-container').swiper({
            mode:'horizontal',
            loop: true,
            pagination: '.slidePagination',
            paginationClickable: true,
            initialSlide: 0
        });
        var relatedAds = $('.swiper-containerRA').swiper({
            mode:'horizontal',
            slidesPerView: 3,
            preventLinks:false
        });
        $(window).on('resize', this.resize).trigger('resize');
    },
    remove: function() {
        $(window).off('resize', this.resize);
        BaseView.prototype.remove.apply(this, arguments);
    },
    resize: function() {
        $('section#itemPage').css('margin-bottom' , ($('#actions').height()+20)+'px');
        var paginationCount = $('.slidePagination span').length + 2;
        var windowSize = $(window).width();
        var paginationWidth = windowSize / paginationCount;
        var paginationMargin = paginationWidth / paginationCount;
        paginationWidth = paginationWidth - paginationMargin;
        $('.slidePagination span').css('width' , paginationWidth+'px');
        $('.slidePagination span').css('margin' , '0 '+paginationMargin+'px');
    }
});

module.exports.id = 'items/show';
