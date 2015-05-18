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
        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
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
        'click .changecity': 'onClickBack',
        'click .btn-cancel': 'onClickCancel'
    },
    onShow: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('headerChange', [this.dictionary['countryoptions.Home_SelectCity'], this.id, 'contact']);
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
        this.parentView.$el.trigger('locationSubmit', [this.dictionary['postingerror.InvalidLocation']]);
    },
    onClickCancel: function(event) {
        if (this.neighborhoods.length && !this.parentView.getItem().has('neighborhood.id')) {
            this.parentView.neighborhoodSelected = false;
        }
        return true;
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

        asynquence().or(fail.bind(this))
            .then(prepare.bind(this))
            .then(fetch.bind(this))
            .val(success.bind(this));

        function prepare(done) {
            $('body > .loading').show();
            done({
                cities: {
                    collection: 'Cities',
                    params: {
                        level: 'states',
                        type: 'cities',
                        location: $state.data('url'),
                        languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
                    }
                }
            });
        }

        function fetch(done, spec) {
            this.app.fetch(spec, {
                readFromCache: false
            }, done.errfcb);
        }

        function success(res) {
            $('body > .loading').hide();
            this.cities = res.cities;
            this.firstRender = false;
            this.render();
            this.$el.trigger('show');
        }

        function fail(err) {
            $('body > .loading').hide();
            console.log(err); // TODO: HANDLE ERRORS
        }
    },
    onClickCity: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $city = $(event.currentTarget);

        asynquence().or(fail.bind(this))
            .then(prepare.bind(this))
            .then(fetch.bind(this))
            .val(success.bind(this));

        function prepare(done) {
            $('body > .loading').show();
            done({
                neighborhoods: {
                    collection: 'Neighborhoods',
                    params: {
                        level: 'cities',
                        type: 'neighborhoods',
                        location: $city.data('url'),
                        languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
                    }
                }
            });
        }

        function fetch(done, spec) {
            this.app.fetch(spec, {
                readFromCache: false
            }, done.errfcb);
        }

        function success(res) {
            var item = this.parentView.getItem();

            $('body > .loading').hide();
            item.unset('neighborhood.id');
            item.unset('neighborhood.name');
            if(res.neighborhoods.length) {
                this.neighborhoods = res.neighborhoods;
                this.secondRender = false;
                this.firstRender = false;
                this.render();
                this.$el.trigger('show');
            }
            else {
                this.neighborhoods = [];
                item.set('location', this.cities.get($city.data('url')).toJSON());
                this.parentView.$el.trigger('flow', [this.id, 'contact']);
            }
            this.city = this.cities.get($city.data('url')).toJSON();
        }

        function fail(err) {
            $('body > .loading').hide();
            console.log(err); // TODO: HANDLE ERRORS
        }
    },
    onClickNeighborhoods: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $neighborhood = $(event.currentTarget);

        this.city.name = $neighborhood.data('name');
        this.parentView.getItem().set('location', this.city);
        this.parentView.getItem().set('neighborhood.id', $neighborhood.data('id'));
        this.parentView.getItem().set('neighborhood.name', $neighborhood.data('name'));
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
