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
        var location = this.app.session.get('location');
        var states = data.states;
        var list = [];
        var currentState = {};

        _.each(order, function(obj, i){
            _.find(categories, function(obj){
                return obj.name == order[i] ? list.push(obj) : false;
            });
        });

        if(location.children.length) {
            _.each(states, function each(state, i){
                if(location.children[0].id == state.id) {
                    currentState = state;
                }
            });
        }

        return _.extend({}, data, {
            categories: list,
            currentState: {
                hostname: currentState.hostname,
                name: currentState.name
            }
        });
    }
});
