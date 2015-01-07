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
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.firstRender = true;
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var states = this.parentView.getStates ? this.parentView.getStates() : data.states;

        return _.extend({}, data, {
            cities: this.cities ? this.cities.toJSON() : data.topCities.toJSON(),
            states: this.firstRender ? (states ? states.toJSON() : []) : [],
            firstRender: this.firstRender
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
        'submit': 'onSubmit'
    },
    onShow: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('headerChange', [translations[this.app.session.get('selectedLanguage') || 'en-US']['countryoptions.Home_SelectCity'], this.id, 'contact']);
        this.$el.removeClass('disabled');
    },
    onHide: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.firstRender = true;
        this.render();
        this.parentView.$el.trigger('locationSubmit', [translations[this.app.session.get('selectedLanguage') || 'en-US']['postingerror.InvalidLocation']]);
    },
    onClickCity: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $city = $(event.currentTarget);

        this.parentView.getItem().set('location', this.cities.get($city.data('url')).toJSON());
        this.parentView.$el.trigger('flow', [this.id, 'contact']);
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
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('flow', [this.id, 'contact']);
    }
});

module.exports.id = 'post/flow/location';
