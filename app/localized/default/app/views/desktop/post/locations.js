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
            $states.trigger('change');
        }
        if ($cities.val()) {
            $cities.trigger('change');
        }
        if ($neighborhoods.val()) {
            $neighborhoods.trigger('change');
        }
    },
    onStateChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);
        var $firstOption = $field.find('option').first();
        var $neighborhoods = this.$('#field-neighborhood');

        $neighborhoods.parents('.field-wrapper').addClass('hide');
        $neighborhoods.empty().attr('required', false);

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
        var $neighborhoods = this.$('#field-neighborhood');
        var url = $field.val();

        if ($firstOption.attr('value') === '') {
            $firstOption.remove();
        }

        var fetch = function(done) {
            this.app.fetch({
                neighborhoods: {
                    collection: 'Neighborhoods',
                    params: {
                        location: url,
                        languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
                    }
                }
            }, {
                readFromCache: false,
                writeToCache: false,
                store: false
            }, done.errfcb);
        }.bind(this);

        var error = function(error) {
            console.log(error); // TODO: HANDLE ERRORS
        }.bind(this);

        var success = function(response) {
            var options = response.neighborhoods.toJSON();
            var location = this.parentView.parentView.getItem().getLocation() || {};

            if (location.children && location.children[0] && location.children[0].type === 'neighborhood') {
                location = location.children[0];
            }
            if (options.length) {
                $neighborhoods.removeAttr('disabled').empty();

                options.unshift({
                    id: '',
                    name: translations.get(this.app.session.get('selectedLanguage'))['countryoptions.SelectANeighborhood']
                });
                _.each(options, function each(neighborhood) {
                    $neighborhoods.append('<option value="' + neighborhood.id + '"' + (location.id === neighborhood.id ? ' selected' : '') + '>' + neighborhood.name + '</option>');
                }, this);
                $neighborhoods.parents('.field-wrapper').removeClass('hide');
            }
            else {
                $neighborhoods.parents('.field-wrapper').addClass('hide');
                this.parentView.parentView.getItem().unset('neighborhood.id');
                this.parentView.parentView.getItem().unset('neighborhood.name');
            }

            this.parentView.$el.trigger('fieldSubmit', [$field]);
        }.bind(this);

        asynquence().or(error)
            .then(fetch)
            .val(success);
    },
    onNeighborhoodChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);

        this.parentView.$el.trigger('fieldSubmit', [{
            name: [$field.attr('name'), 'id'].join('.'),
            value: $field.val()
        }]);
        this.parentView.$el.trigger('fieldSubmit', [{
            name: [$field.attr('name'), 'name'].join('.'),
            value: $field.find(':selected').text()
        }]);

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
