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
        var countryMapStyle = config.get('countryMapStyle');
        var videos = config.get(['videos', location.url]);
        var testimonials = config.get(['testimonials', location.url]);
        var countryMapClass;

        categories = helpers.common.categoryOrder(categories, location.url);

        _.each(countryMapStyle, function each(country, style){
            if (_.contains(country,location.url)){
                countryMapClass = style;
            }
        });

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
            videos: videos,
            selectedLanguage: selectedLanguage,
            currentState: {
                hostname: currentState.hostname,
                name: currentState.name
            }
        });
    }
});
