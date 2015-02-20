'use strict';

var Base = require('../../../../../../common/app/bases/view');
var translations = require('../../../../../../../../shared/translations');
var asynquence = require('asynquence');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'post_flow_location_view cities-links disabled',
    id: 'location',
    tagName: 'section',
    firstRender: true,
    secondRender: true,
    city: {},
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.firstRender = true;
        this.secondRender = true;
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var states = this.parentView.getStates ? this.parentView.getStates() : data.states;

        return _.extend({}, data, {
            cities: this.secondRender ? (this.cities ? this.cities.toJSON() : data.topCities.toJSON()) : [],
            states: this.firstRender ? (states ? states.toJSON() : []) : [],
            neighborhoods: this.secondRender === false ? this.neighborhoods.toJSON() : [],
            firstRender: this.firstRender,
            secondRender: this.secondRender
        });
    },
    postRender: function() {
        this.cities = this.cities || this.parentView.getTopCities();
    },
    events: {
        'show': 'onShow',
        'hide': 'onHide',
        'click .city': 'onClickCity',
        'click .state': 'onClickState',
        'click .neighborhood': 'onClickNeighborhoods',
        'submit': 'onSubmit',
        'click .changecity': 'onClickBack'
    },
    onShow: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('headerChange', [translations.get(this.app.session.get('selectedLanguage'))['countryoptions.Home_SelectCity'], this.id, 'contact']);
        this.$el.removeClass('disabled');
    },
    onHide: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.firstRender = true;
        this.secondRender = true;
        this.neighborhoods = [];
        this.render();
        this.parentView.$el.trigger('locationSubmit', [translations.get(this.app.session.get('selectedLanguage'))['postingerror.InvalidLocation']]);
    },
    onClickBack: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        $('body > .loading').hide();
        this.firstRender = true;
        this.secondRender = true;
        this.cities = this.parentView.getTopCities();
        this.neighborhoods = [];
        this.render();
        this.$el.trigger('show');
    },
    onClickState: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $state = $(event.currentTarget);

        var fetch = function(done) {
            $('body > .loading').show();
            this.app.fetch({
                cities: {
                    collection: 'Cities',
                    params: {
                        level: 'states',
                        type: 'cities',
                        location: $state.data('url'),
                        languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var error = function(err) {
            $('body > .loading').hide();
            console.log(err); // TODO: HANDLE ERRORS
        }.bind(this);

        var success = function(res) {
            $('body > .loading').hide();
            this.cities = res.cities;
            this.firstRender = false;
            this.render();
            this.$el.trigger('show');
        }.bind(this);

        asynquence().or(error)
            .then(fetch)
            .val(success);
    },
    onClickCity: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $city = $(event.currentTarget);
        var fetch = function(done) {
            $('body > .loading').show();
            this.app.fetch({
                neighborhoods: {
                    collection: 'Neighborhoods',
                    params: {
                        level: 'cities',
                        type: 'neighborhoods',
                        location: $city.data('url'),
                        languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var error = function(err) {
            $('body > .loading').hide();
            console.log(err); // TODO: HANDLE ERRORS
        }.bind(this);

        var success = function(res) {
            var options = res.neighborhoods;
            var aux = res.neighborhoods.toJSON();

            $('body > .loading').hide();
            if(aux.length) {
                this.neighborhoods = options;
                this.secondRender = false;
                this.firstRender = false;
                this.render();
                this.$el.trigger('show');
            } else {
                this.parentView.getItem().set('location', this.cities.get($city.data('url')).toJSON());
                this.parentView.getItem().unset('neighborhood.id');
                this.parentView.getItem().unset('neighborhood.name');
                this.parentView.$el.trigger('flow', [this.id, 'contact']);
            }
            this.city = this.cities.get($city.data('url')).toJSON();
        }.bind(this);

        asynquence().or(error)
            .then(fetch)
            .val(success);
    },
    onClickNeighborhoods: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $nb = $(event.currentTarget);

        this.city.name = $nb.data('name');
        this.parentView.getItem().set('location', this.city);
        this.parentView.getItem().set('neighborhood.id', $nb.data('id'));
        this.parentView.getItem().set('neighborhood.name', $nb.data('name'));
        this.parentView.neighborhoodSelected = true;
        this.parentView.$el.trigger('flow', [this.id, 'contact']);
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        this.parentView.$el.trigger('flow', [this.id, 'contact']);
    }
});

module.exports.id = 'post/flow/location';
