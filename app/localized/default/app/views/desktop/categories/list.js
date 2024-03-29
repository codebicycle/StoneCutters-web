'use strict';

var _ = require('underscore');
var URLParser = require('url');
var Base = require('../../../../../common/app/bases/view').requireView('categories/list');
var helpers = require('../../../../../../helpers');
var Chat = require('../../../../../../modules/chat');
var Metric = require('../../../../../../modules/metric');
var config = require('../../../../../../../shared/config');

module.exports = Base.extend({
    tagName: 'main',
    id: 'categories-list-view',
    className: 'categories-list-view',
    events: {
        'click .open-modal': 'onOpenModal',
        'click [data-modal-shadow], [data-modal-close]': 'onCloseModal',
        'click [data-increment-metric]': Metric.incrementEventHandler,
        'click li.category li a': 'onCategoryClick'
    },
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
        var topCities = config.getForMarket(location.url, ['cities', 'top'], location.metadata.seo.topLocations.firstLevel.entities);
        var maxTopCities = config.getForMarket(location.url, ['cities', 'max'], 7);

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
            topCities: topCities,
            maxTopCities: maxTopCities,
            selectedLanguage: selectedLanguage,
            marketing: marketing,
            chatEnabled: Chat.isEnabled.call(this),
            chatDepartment: Chat.getDepartment.call(this),
            currentState: {
                hostname: currentState.hostname,
                name: currentState.name
            }
        });
    },
    postRender: function() {
        this.app.sixpack.convert(this.app.sixpack.experiments.dgdHomePage);
    },
    onOpenModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        $('#location-modal').trigger('show');
    },
    onCloseModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        $('#location-modal').trigger('hide');
    },
    onCategoryClick: function(event) {
        var path = $(event.currentTarget).attr('href');
        var experiment = this.app.sixpack.experiments.dgdCategoryCars;

        this.app.sixpack.convert(experiment);
        if (experiment && experiment.alternative && experiment.alternative === 'gallery' && this.isCategoryCars(path)) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            path = URLParser.parse(path).path;
            this.app.router.redirectTo(helpers.common.linkig.call(this, path, null, 'showig'));
        }
    },
    isCategoryCars: function(url) {
        return _.contains([378], Number((url.match(/.+-cat-(\d+).*/) || [])[1] || 0));
    }
});
