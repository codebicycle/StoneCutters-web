var BaseView = require('../base');
var _ = require('underscore');

if (typeof window != 'undefined') {
	var Swipe = require('../../lib/swiper');
};

module.exports = BaseView.extend({
  className: 'items_show_view',

	paginationSize: function(){
		var paginationCount = $('.slidePagination span').length + 2;
		var windowSize = $(window).width();
		var paginationWidth = windowSize / paginationCount;
		var paginationMargin = paginationWidth / paginationCount;
		paginationWidth = paginationWidth - paginationMargin; 

		$('.slidePagination span').css('width' , paginationWidth+'px');
		$('.slidePagination span').css('margin' , '0 '+paginationMargin+'px');
	},


  	getTemplateData: function() {
    	var data = BaseView.prototype.getTemplateData.call(this);
    	data.category_name = this.options.category_name;
    	data.item.location.cityName = data.item.location.children[0].children[0].name; 
    	data.item.description = data.item.description.replace(/(<([^>]+)>)/ig,"");
    	return data;
  	},

  	postRender: function(){
  		
  		var mySwiper = $('.swiper-containerItem').swiper({
			mode:'horizontal',
			loop: true,
			pagination: '.slidePagination',
			paginationClickable: true,
			initialSlide: 0
		});
		this.paginationSize();

		$('section#itemPage').css('margin-bottom' , ($('#actions').height()+20)+'px');

		$( window ).resize(function() {
		  $('section#itemPage').css('margin-bottom' , ($('#actions').height()+20)+'px');
		  paginationSize();
		});
	}
  


});
module.exports.id = 'items/show';
