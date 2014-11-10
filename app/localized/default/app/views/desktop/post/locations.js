'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');
var asynquence = require('asynquence');
var translations = require('../../../../../../../shared/translations');

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-locations-view',
    className: 'posting-locations-view',
    initialize: function() {
        Base.prototype.initialize.call(this);
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var states = data.states;
        var cities = data.cities;
        var location = data.currentLocation;

        if (states) {
            states = _.map(states.toJSON(), function each(state) {
                return {
                    key: state.url,
                    value: state.name
                };
            });
        }
        if (!location.state) {
            this.addEmptyOption(states, 'countryoptions.Home_SelectState');
        }
        if (cities) {
            cities = _.map(cities.toJSON(), function each(city) {
                return {
                    key: city.url,
                    value: city.name
                };
            });
        }
        else {
            cities = [];
        }
        if (!location.city) {
            this.addEmptyOption(cities, 'countryoptions.Home_SelectCity');
        }
        return _.extend({}, data, {
            states: states,
            cities: cities,
            location: location
        });
    },
    events: {
        'formRendered': 'onFormRendered',
        'change #field-state': 'onStateChange',
        'change #field-location': 'onCityChange'
    },
    addEmptyOption: function(list, text) {

        list.unshift({
            key: '',
            value: translations[this.app.session.get('selectedLanguage') || 'en-US'][text]
        });
    },
    onFormRendered: function(event) {
        var $states = $('#field-state');
        var $cities = $('#field-location');

        if ($states.val()) {
            this.parentView.$el.trigger('fieldSubmit', [$states]);
        }
        if ($cities.val()) {
            this.parentView.$el.trigger('fieldSubmit', [$cities]);
        }
    },
    onStateChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);
        var $firstOption = $field.find('option').first();

        if ($firstOption.attr('value') === '') {
            $firstOption.remove();
        }

        this.getCities($field.val());
        this.parentView.$el.trigger('fieldSubmit', [$field]);
    },
    onCityChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);
        var $firstOption = $field.find('option').first();

        if ($firstOption.attr('value') === '') {
            $firstOption.remove();
        }

        this.parentView.$el.trigger('fieldSubmit', [$field]);
    },
    getCities: function(state) {
        var options;
        var $cities = this.$('#field-location');

        var fetch = function(done) {
            this.app.fetch({
                cities: {
                    collection: 'Cities',
                    params: {
                        level: 'states',
                        type: 'cities',
                        location: state,
                        languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
                    }
                }
            }, done.errfcb);
        }.bind(this);

        var parse = function(done, response) {
            options = _.map(response.cities.toJSON(), function each(city) {
                return {
                    key: city.url,
                    value: city.name
                };
            });
            options.unshift({
                key: '',
                value: translations[this.app.session.get('selectedLanguage') || 'en-US']['countryoptions.Home_SelectCity']
            });
            done(options);
        }.bind(this);

        var error = function(error) {
            console.log(error); // TODO: HANDLE ERRORS
        }.bind(this);

        var success = function(options) {
            $cities.removeAttr('disabled').empty();
            _.each(options, function each(city) {
                $cities.append('<option value="' + city.key + '">' + city.value + '</option>');
            }.bind(this));
            this.parentView.$el.trigger('fieldSubmit', [$cities]);
        }.bind(this);

        asynquence().or(error)
            .then(fetch)
            .then(parse)
            .val(success);
    }
});

module.exports.id = 'post/locations';
