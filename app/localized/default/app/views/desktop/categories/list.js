'use strict';

var Base = require('../../../../../common/app/bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'main',
    id: 'categories-list-view',
    className: 'categories-list-view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var categories = data.categories;
        var order = ['For Sale','Classes','Vehicles','Community','Real Estate','Services','Jobs'];
        var list = [];

        _.each(order, function(obj, i){
            _.find(categories, function(obj){
                return obj.name == order[i] ? list.push(obj) : false;
            });
        });

        return _.extend({}, data, {
            location: this.app.session.get('location'),
            categories: list
        });
    }
});

module.exports.id = 'categories/list';
