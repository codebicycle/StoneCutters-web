'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('categories/list');
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
    },
    postRender: function() {
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);
    },
    onStart: function(event) {
        this.appView.trigger('home:start');
    },
    onEnd: function(event) {
        this.appView.trigger('home:end');
    }
});
