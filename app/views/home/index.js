var BaseView = require('../base');
var _ = require('underscore');

if (typeof window != 'undefined') {
	var Swipe = require('../../lib/swipe');
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

        // this.slider1 = new Swipe(document.getElementById('slider1'), {
        //                 //startSlide: 2,
        //                 //speed: 400,
        //                 //auto: 3000,
        //                 'items':10,
        //                 'callback': function(event, index, elem) {
        //                 }
        // });

        window.whatsNewSwipe = Swipe(document.getElementById('whats-new-slider'));
        window.LastVisitedSwipe = Swipe(document.getElementById('last-visited-slider'));

    // $(this.el).find('#slider2').html(this.lastVisitCT({'item': this.lastVisitedItems.toJSON()}));
    // 	this.slider2 = new Swipe(document.getElementById('slider2'), {
    //                     //startSlide: 2,
    //                     //speed: 400,
    //                     //auto: 3000,
    //                     'items':ScreenHelper.getImgsNum(),
    //                     'callback': function(event, index, elem) {
    //                     }
    // });
  }
});
module.exports.id = 'home/index';
