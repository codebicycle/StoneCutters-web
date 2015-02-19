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
        'change #field-location': 'onCityChange',
        'change #field-neighborhood': 'onNeighborhoodChange'
    },
    addEmptyOption: function(list, text) {
        list.unshift({
            key: '',
            value: translations.get(this.app.session.get('selectedLanguage'))[text]
        });
    },
    onFormRendered: function(event) {
        var $states = $('#field-state');
        var $cities = $('#field-location');
        var $neighborhoods = $('#field-neighborhood');

        if ($states.val()) {
            $states.trigger('change', [true]);
        }
        if ($cities.val()) {
            $cities.trigger('change', [true]);
        }
        if ($neighborhoods.val()) {
            $neighborhoods.trigger('change', [true]);
        }
    },
    onStateChange: function(event, skipValidation) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);
        var $firstOption = $field.find('option').first();
        var $cities = $('#field-location');

        if ($firstOption.attr('value') === '') {
            $firstOption.remove();
        }

        this.resetNeighborhoods();
        this.getCities($field.val(), skipValidation, ($cities.val() ? [$cities.val()] : undefined));
        this.parentView.$el.trigger('fieldSubmit', [$field, skipValidation]);
    },
    onCityChange: function(event, skipValidation) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);
        var $firstOption = $field.find('option').first();

        if ($firstOption.attr('value') === '') {
            $firstOption.remove();
        }

        this.getNeighborhoods($field.val(), skipValidation);
        this.parentView.$el.trigger('fieldSubmit', [$field, skipValidation]);
    },
    onNeighborhoodChange: function(event, skipValidation) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);
        var $firstOption = $field.find('option').first();

        if ($firstOption.attr('value') === '') {
            $firstOption.remove();
        }

        this.parentView.$el.trigger('fieldSubmit', [$field, skipValidation]);
    },
    getCities: function(state, skipValidation, cityId) {
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
                value: translations.get(this.app.session.get('selectedLanguage'))['countryoptions.Home_SelectCity']
            });
            done(options);
        }.bind(this);

        var error = function(error) {
            console.log(error); // TODO: HANDLE ERRORS
        }.bind(this);

        var success = function(options) {
            $cities.removeAttr('disabled').empty();
            _.each(options, function each(city) {
                $cities.append('<option value="' + city.key + '"' + (city.key == cityId ? 'selected="selected"' : '') + '>' + city.value + '</option>');
            }.bind(this));
            this.parentView.$el.trigger('fieldSubmit', [$cities, skipValidation]);
        }.bind(this);

        asynquence().or(error)
            .then(fetch)
            .then(parse)
            .val(success);
    },
    getNeighborhoods: function(city, skipValidation) {
        var options;
        var $neighborhoods = this.$('#field-neighborhood');

        var fetch = function(done) {
            this.app.fetch({
                neighborhoods: {
                    collection: 'Neighborhoods',
                    params: {
                        location: city,
                        languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
                    }
                }
            }, {
                readFromCache: false,
                writeToCache: false,
                store: false
            }, done.errfcb);
        }.bind(this);

        var parse = function(done, response) {
            options = _.map(response.neighborhoods.toJSON(), function each(neighborhood) {
                return {
                    key: neighborhood.id,
                    value: neighborhood.name
                };
            });
            if (options.length) {
                options.unshift({
                    key: '',
                    value: translations.get(this.app.session.get('selectedLanguage'))['item.SelectA_Neighborhood']
                });
            }
            done(options);
        }.bind(this);

        var error = function(error) {
            console.log(error); // TODO: HANDLE ERRORS
        }.bind(this);

        var success = function(options) {
            if (options.length) {
                $neighborhoods.removeAttr('disabled').attr('required', true).empty();
                $neighborhoods.parents('.field-wrapper').removeClass('hide');
                _.each(options, function each(neighborhood) {
                    $neighborhoods.append('<option value="' + neighborhood.key + '">' + neighborhood.value + '</option>');
                }.bind(this));
                this.parentView.$el.trigger('fieldSubmit', [$neighborhoods, skipValidation]);
            }
            else {
                this.resetNeighborhoods();
            }
        }.bind(this);

        asynquence().or(error)
            .then(fetch)
            .then(parse)
            .val(success);

    },
    resetNeighborhoods: function() {
        var $neighborhoods = this.$('#field-neighborhood');

        delete this.parentView.parentView.errors.neighborhoods;
        $neighborhoods.parents('.field-wrapper').addClass('hide').removeClass('error');
        $neighborhoods.siblings('.error.message').remove();
        $neighborhoods.empty().attr('required', false);
    }
});

module.exports.id = 'post/locations';
