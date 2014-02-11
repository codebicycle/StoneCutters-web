var BaseView = require('../base');
var _ = require('underscore');

if (typeof window != 'undefined') {
	var Swipe = require('../../lib/swiper');
};

module.exports = BaseView.extend({
    className: 'home_index_view',

    getTemplateData:function(){
        // Get `super`.
        var data = BaseView.prototype.getTemplateData.call(this);
        
        return _.extend({}, 
                        data, 
                        {
                            count: this.app.get('session').count
                        });   
    },

    postRender: function(){

        

        var swiperAds = $('.swiper-containerAds').swiper({
            mode:'horizontal',
            slidesPerView: 3,
            preventLinks:false
        });
        var swiperAds = $('.swiper-containerCats').swiper({
            mode:'horizontal',
            slidesPerView: 4,
            preventLinks:false,
        });

        
    },
});
module.exports.id = 'home/index';
