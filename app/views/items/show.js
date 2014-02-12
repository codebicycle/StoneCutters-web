var BaseView = require('../base');
var _ = require('underscore');

if (typeof window != 'undefined') {
	var Swipe = require('../../lib/swiper');
};

module.exports = BaseView.extend({
  className: 'items_show_view',

  getTemplateData: function() {
    var data = BaseView.prototype.getTemplateData.call(this);
    data.category_name = this.options.category_name;
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
  },
});
module.exports.id = 'items/show';
