'use strict';

var Base = require('../../bases/view');

module.exports = Base.extend({
    className: 'categories_sort_view'
    /*,
    getTemplateData : function() {
    	var data = Base.prototype.getTemplateData.call(this);
        return _.extend({}, data, {
        });
    }
    ,
    postRender: function() {
    	
    },
    getTemplateData: function() {
        console.log("paso 2");
        var data = Base.prototype.getTemplateData.call(this);

        return data;
    }*/
});

module.exports.id = 'categories/sort';