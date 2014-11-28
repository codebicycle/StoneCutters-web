'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('categories/list');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    tagName: 'main',
    id: 'categories-list-view',
    className: 'categories-list-view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location');
        var states = data.states;
        var categories = data.categories;
        var currentState = {};

        categories = helpers.common.categoryOrder(categories, this.app.session.get('siteLocation'));

        if(location.children.length) {
            _.each(states, function each(state, i){
                if(location.children[0].id == state.id) {
                    currentState = state;
                }
            });
        }

        return _.extend({}, data, {
            categories: categories,
            currentState: {
                hostname: currentState.hostname,
                name: currentState.name
            }
        });
    }
});
