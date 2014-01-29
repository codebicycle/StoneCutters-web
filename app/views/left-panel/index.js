var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'left-panel_index_view',

    getTemplateData:function(){
        // Get `super`.
        var data = BaseView.prototype.getTemplateData.call(this);
        
        return _.extend({}, 
                        data, 
                        {
                            categories: this.app.get('baseData').categories,
                            siteLocation: this.app.get('baseData').siteLocation
                        });
    },

    postRender: function(){

    },
});
module.exports.id = 'left-panel/index';
