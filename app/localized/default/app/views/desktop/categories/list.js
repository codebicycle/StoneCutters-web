'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('categories/list');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');
var config = require('../../../../../../../shared/config');

module.exports = Base.extend({
    tagName: 'main',
    id: 'categories-list-view',
    className: 'categories-list-view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location');
        var selectedLanguage = this.app.session.get('selectedLanguage').split('-')[0];
        var states = data.states;
        var categories = data.categories;
        var currentState = {};
        var countryMapClass = config.getForMarket(location.url, ['countryMapStyle'], '');
        var marketing = config.getForMarket(location.url, ['marketing'], '');
        var testimonials = config.getForMarket(location.url, ['testimonials'], '');
        var celebrities = config.getForMarket(location.url, ['celebrities'], '');

        categories = helpers.common.categoryOrder(categories, location.url);

        if(location.children.length) {
            _.each(states, function each(state, i){
                if(location.children[0].id == state.id) {
                    currentState = state;
                }
            });
        }

        return _.extend({}, data, {
            categories: categories,
            countryMapClass: countryMapClass,
            testimonials: testimonials,
            celebrities: celebrities,
            selectedLanguage: selectedLanguage,
            marketing: marketing,
            currentState: {
                hostname: currentState.hostname,
                name: currentState.name
            }
        });
    }
});
