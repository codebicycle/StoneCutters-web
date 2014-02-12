var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'location_index_view',

    getTemplateData:function(){
        // Get `super`.
        var data = BaseView.prototype.getTemplateData.call(this);

        return _.extend({}, 
                        data, 
                        {
                            location: this.app.get('baseData').location
                        });
    },

    postRender: function(){

    },

    events: {
        "click .city": "changeCity"
    },

    changeCity: function() {
        console.log("HOLA!!!");
    }
});
module.exports.id = 'location/index';