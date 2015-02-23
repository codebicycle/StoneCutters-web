'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('categories/list');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');
var config = require('../../../../../../../shared/config');
var Chat = require('../../../../../../modules/chat');

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
        var videos = config.getForMarket(location.url, ['videos'], '');
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
            videos: videos,
            selectedLanguage: selectedLanguage,
            chatEnabled: Chat.isEnabled.call(this),
            currentState: {
                hostname: currentState.hostname,
                name: currentState.name
            }
        });
    },
    postRender: function() {
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);
    },
    onEnd: function(event) {
        Chat.hide.call(this);
        this.appView.trigger('list:end');
    },
    onStart: function(event) {
        this.appView.trigger('list:start');
        Chat.show.call(this);
    },
});
